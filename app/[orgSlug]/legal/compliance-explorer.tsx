"use client";

import {
  AI_COMPLIANCE_FRAMEWORKS,
  AI_COMPLIANCE_SITUATIONS,
} from "@/lib/ai-compliance-reference";
import { useMemo, useState } from "react";

export function ComplianceExplorer() {
  const [query, setQuery] = useState("");
  const [situationId, setSituationId] = useState("all");

  const selected = AI_COMPLIANCE_SITUATIONS.find(
    (situation) => situation.id === situationId,
  );

  const frameworks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const allowed = selected ? new Set(selected.frameworkIds) : null;

    return AI_COMPLIANCE_FRAMEWORKS.filter((framework) => {
      if (allowed && !allowed.has(framework.id)) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        framework.name.toLowerCase().includes(needle) ||
        framework.jurisdiction.toLowerCase().includes(needle) ||
        framework.summary.toLowerCase().includes(needle) ||
        framework.watchFor.toLowerCase().includes(needle)
      );
    });
  }, [query, selected]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2B3C]/50">
            Situation
          </span>
          <select
            value={situationId}
            onChange={(event) => setSituationId(event.target.value)}
            className="mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-white px-3 py-2.5 text-sm text-[#1A2B3C] outline-none focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
          >
            <option value="all">All frameworks</option>
            {AI_COMPLIANCE_SITUATIONS.map((situation) => (
              <option key={situation.id} value={situation.id}>
                {situation.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2B3C]/50">
            Search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="HIPAA, FDA, EU AI Act, state privacy…"
            className="mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-white px-3 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20"
          />
        </label>
      </div>

      {selected ? (
        <div className="rounded-sm border border-[#C4A574]/40 bg-[#C4A574]/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1F6A64]">
            Situation
          </p>
          <h3 className="mt-1 font-serif text-xl font-medium text-[#1A2B3C]">
            {selected.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/75">
            {selected.detail}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4">
        {frameworks.length === 0 ? (
          <p className="text-sm text-[#1A2B3C]/55">
            No frameworks match that filter.
          </p>
        ) : (
          frameworks.map((framework) => (
            <article
              key={framework.id}
              className="rounded-sm border border-[#1A2B3C]/12 bg-white/70 p-5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1F6A64]">
                {framework.jurisdiction}
              </p>
              <h3 className="mt-1 font-serif text-xl font-medium text-[#1A2B3C]">
                {framework.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
                {framework.summary}
              </p>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1A2B3C]/45">
                  Watch for
                </p>
                <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/75">
                  {framework.watchFor}
                </p>
              </div>
              <a
                href={framework.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
              >
                Official source →
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
