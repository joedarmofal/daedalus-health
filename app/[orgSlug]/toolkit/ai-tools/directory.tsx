"use client";

import {
  AI_TOOL_CATEGORIES,
  countAiTools,
  type AiToolCategory,
} from "@/lib/ai-tools-directory";
import { useMemo, useState } from "react";

export function AiToolsDirectory() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return AI_TOOL_CATEGORIES.map((category) => {
      const tools = category.tools.filter((tool) => {
        if (activeId !== "all" && category.id !== activeId) {
          return false;
        }
        if (!needle) return true;
        return (
          tool.name.toLowerCase().includes(needle) ||
          tool.summary.toLowerCase().includes(needle) ||
          category.label.toLowerCase().includes(needle)
        );
      });
      return { ...category, tools };
    }).filter((category) => category.tools.length > 0);
  }, [activeId, query]);

  const visibleCount = filtered.reduce(
    (sum, category) => sum + category.tools.length,
    0,
  );

  return (
    <div>
      <div className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-5 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]">
        <label className="block text-sm font-medium text-[#1A2B3C]" htmlFor="ai-tools-search">
          Search the directory
        </label>
        <input
          id="ai-tools-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Abridge, coding, legal, imaging…"
          className="mt-2 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip
            label={`All (${countAiTools()})`}
            active={activeId === "all"}
            onClick={() => setActiveId("all")}
          />
          {AI_TOOL_CATEGORIES.map((category) => (
            <FilterChip
              key={category.id}
              label={category.label}
              active={activeId === category.id}
              onClick={() => setActiveId(category.id)}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-[#1A2B3C]/50">
          Showing {visibleCount} of {countAiTools()} tools
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-[#1A2B3C]/60">
          No tools match that search. Try a vendor name or a category such as
          “scribe”, “coding”, or “legal”.
        </p>
      ) : (
        filtered.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide transition ${
        active
          ? "border-[#1F6A64] bg-[#1F6A64] text-[#F9F8F3]"
          : "border-[#1A2B3C]/20 bg-[#F7F5F0] text-[#1A2B3C]/75 hover:border-[#C4A574] hover:text-[#1A2B3C]"
      }`}
    >
      {label}
    </button>
  );
}

function CategorySection({ category }: { category: AiToolCategory }) {
  return (
    <section id={category.id} className="mt-10 scroll-mt-28">
      <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
        {category.label}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#1A2B3C]/65">
        {category.description}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {category.tools.map((tool) => (
          <article
            key={tool.name}
            className="flex flex-col rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]"
          >
            <h3 className="font-serif text-lg font-medium text-[#1A2B3C]">
              {tool.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#1A2B3C]/70">
              {tool.summary}
            </p>
            <a
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-fit items-center text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
            >
              Visit site
              <span aria-hidden="true" className="ml-1.5">
                →
              </span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
