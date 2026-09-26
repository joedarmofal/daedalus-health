export interface AiNewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
}

const FEEDS = [
  {
    source: "Google News",
    url: "https://news.google.com/rss/search?q=healthcare+AI+regulation+OR+FDA+%22artificial+intelligence%22+OR+HIPAA+AI+law+OR+%22AI+Act%22+health&hl=en-US&gl=US&ceid=US:en",
  },
  {
    source: "HIPAA Journal",
    url: "https://www.hipaajournal.com/feed/",
  },
];

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

function parseRss(xml: string, fallbackSource: string): AiNewsItem[] {
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return blocks
    .map((block) => {
      const rawTitle = innerTag(block[1], "title");
      const sourceFromFeed = innerTag(block[1], "source");
      const title = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim() || rawTitle;
      return {
        title,
        url: innerTag(block[1], "link") || innerTag(block[1], "guid"),
        source: sourceFromFeed || fallbackSource,
        publishedAt: innerTag(block[1], "pubDate") || null,
      };
    })
    .filter((item) => item.title && item.url.startsWith("http"));
}

function toTime(value: string | null): number {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

export async function fetchAiComplianceNews(): Promise<AiNewsItem[]> {
  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: { "User-Agent": "DaedalusHealth/1.0 (compliance news)" },
          next: { revalidate: 1800 },
        });
        if (!response.ok) return [];
        const xml = await response.text();
        return parseRss(xml, feed.source);
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  return results
    .flat()
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt))
    .slice(0, 18);
}
