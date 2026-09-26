"use client";

import type { AiNewsItem } from "@/lib/ai-news";
import { useEffect, useState } from "react";

export function LegalNewsFeed() {
  const [items, setItems] = useState<AiNewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/ai-news", { cache: "no-store" });
        const payload = (await response.json()) as {
          items?: AiNewsItem[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "News feed is unavailable.");
        }
        if (!cancelled) {
          setItems(payload.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "News feed is unavailable.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-sm text-[#1A2B3C]/55">Loading recent headlines…</p>
    );
  }

  if (error) {
    return (
      <p className="rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[#1A2B3C]/55">
        No recent headlines were returned. Try again in a few minutes.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={`${item.source}-${item.url}`}
          className="rounded-sm border border-[#1A2B3C]/12 bg-white/70 p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1F6A64]">
            {item.source}
            {item.publishedAt
              ? ` · ${new Date(item.publishedAt).toLocaleDateString()}`
              : ""}
          </p>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block font-medium text-[#1A2B3C] hover:text-[#1F6A64]"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
