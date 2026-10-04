import type { HealthcareNewsItem } from "@/lib/healthcare-news-types";

export type { HealthcareNewsItem };

export const HEALTHCARE_NEWS_FEEDS = [
  {
    source: "Google News",
    url: "https://news.google.com/rss/search?q=%22healthcare%20AI%22%20OR%20%22medical%20AI%22%20OR%20%22clinical%20AI%22&hl=en-US&gl=US&ceid=US:en",
  },
  {
    source: "STAT News",
    url: "https://www.statnews.com/category/health-tech/feed/",
  },
  {
    source: "Fierce Healthcare",
    url: "https://www.fiercehealthcare.com/rss/xml",
  },
  {
    source: "MedPage Today",
    url: "https://www.medpagetoday.com/rss/headlines.xml",
  },
] as const;

const AI_PATTERN =
  /\b(ai|a\.i\.|artificial intelligence|machine learning|llm|llms|generative ai|clinical ai|medical ai|healthcare ai)\b/i;

const FETCH_TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_ITEMS = 20;

let memoryCache: { items: HealthcareNewsItem[]; expiresAt: number } | null =
  null;

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function innerTag(block: string, name: string): string {
  const match = block.match(
    new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

function hrefAttr(block: string, name: string): string {
  const match = block.match(
    new RegExp(`<${name}[^>]*href=["']([^"']+)["'][^>]*/?>`, "i"),
  );
  return match ? decodeXml(match[1]) : "";
}

function parseRss(xml: string, fallbackSource: string): HealthcareNewsItem[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((block) => {
    const rawTitle = innerTag(block[1], "title");
    const sourceFromFeed = innerTag(block[1], "source");
    const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim() || rawTitle;
    return {
      title,
      link: innerTag(block[1], "link") || innerTag(block[1], "guid"),
      source: sourceFromFeed || fallbackSource,
      publishedAt: innerTag(block[1], "pubDate") || null,
    };
  });

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map(
    (block) => {
      const title = innerTag(block[1], "title");
      return {
        title,
        link: hrefAttr(block[1], "link") || innerTag(block[1], "id"),
        source: innerTag(block[1], "author") || fallbackSource,
        publishedAt:
          innerTag(block[1], "published") ||
          innerTag(block[1], "updated") ||
          null,
      };
    },
  );

  return [...items, ...entries].filter(
    (item) => item.title && item.link.startsWith("http"),
  );
}

function mentionsAi(item: HealthcareNewsItem): boolean {
  return AI_PATTERN.test(`${item.title} ${item.source}`);
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function toTime(value: string | null): number {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

async function fetchFeed(
  feed: (typeof HEALTHCARE_NEWS_FEEDS)[number],
): Promise<HealthcareNewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DaedalusHealth/1.0; +https://daedalushealth.ai)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const xml = await response.text();
    if (!xml.includes("<rss") && !xml.includes("<feed")) return [];
    return parseRss(xml, feed.source);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchHealthcareAiNews(): Promise<HealthcareNewsItem[]> {
  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.items;
  }

  const results = await Promise.all(
    HEALTHCARE_NEWS_FEEDS.map((feed) => fetchFeed(feed)),
  );

  const seenLinks = new Set<string>();
  const seenTitles = new Set<string>();
  const items = results
    .flat()
    .filter(mentionsAi)
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
    .filter((item) => {
      const linkKey = item.link.split("?")[0].toLowerCase();
      const titleKey = normalizeTitle(item.title);
      if (seenLinks.has(linkKey) || seenTitles.has(titleKey)) return false;
      seenLinks.add(linkKey);
      seenTitles.add(titleKey);
      return true;
    })
    .slice(0, MAX_ITEMS);

  memoryCache = {
    items,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return items;
}
