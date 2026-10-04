"use client";

import type { HealthcareNewsItem } from "@/lib/healthcare-news-types";
import { useEffect, useState } from "react";

export function NewsTicker({
  initialItems = [],
}: {
  initialItems?: HealthcareNewsItem[];
}) {
  const [items, setItems] = useState<HealthcareNewsItem[] | null>(
    initialItems.length > 0 ? initialItems : null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/news");
        const payload = (await response.json()) as {
          items?: HealthcareNewsItem[];
        };
        if (!cancelled && Array.isArray(payload.items)) {
          setItems(payload.items);
        } else if (!cancelled && initialItems.length === 0) {
          setItems([]);
        }
      } catch {
        if (!cancelled && initialItems.length === 0) setItems([]);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialItems.length]);

  if (items && items.length === 0) return null;

  return (
    <section
      id="news"
      className="scroll-mt-24 border-b border-[#C4A574]/35 bg-[#1A2B3C]"
      aria-label="Healthcare AI news"
    >
      <div className="mx-auto flex max-w-6xl items-baseline justify-between gap-4 px-4 pt-4 sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[#C4A574]">
          HEALTHCARE AI NEWS
        </p>
        <p className="text-[10px] tracking-wide text-[#F9F8F3]/40">
          Headlines via public RSS feeds
        </p>
      </div>

      {!items ? (
        <div className="mt-3 overflow-hidden px-4 pb-5 sm:px-6">
          <div className="flex gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-4 w-56 shrink-0 animate-pulse rounded-sm bg-[#F9F8F3]/10"
              />
            ))}
          </div>
        </div>
      ) : (
        <TickerTrack items={items} />
      )}
    </section>
  );
}

function Headline({ item }: { item: HealthcareNewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex max-w-[28rem] shrink-0 items-baseline gap-2 whitespace-nowrap sm:max-w-[36rem]"
    >
      <span className="truncate text-sm text-[#F9F8F3]/88 hover:text-[#C4A574]">
        {item.title}
      </span>
      <span className="shrink-0 text-[11px] tracking-wide text-[#F9F8F3]/40">
        · {item.source}
      </span>
    </a>
  );
}

function TickerTrack({ items }: { items: HealthcareNewsItem[] }) {
  const loop = [...items, ...items];

  return (
    <>
      <div
        className="news-ticker mt-3 hidden overflow-hidden pb-5 motion-safe:block"
        tabIndex={0}
      >
        <div className="news-ticker-track flex w-max gap-10 px-4 sm:px-6">
          {loop.map((item, index) => (
            <Headline
              key={`${item.link}-${index}`}
              item={item}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto pb-5 motion-safe:hidden">
        <div className="flex w-max gap-8 px-4 sm:px-6">
          {items.map((item) => (
            <Headline key={item.link} item={item} />
          ))}
        </div>
      </div>
    </>
  );
}
