"use client";

import {
  COMPLEXITY_OPTIONS,
  DEFAULT_QUOTE_INPUTS,
  ENGAGEMENT_TYPES,
  QUOTE_STORAGE_KEY,
  SCOPE_MODULES,
  SIZE_OPTIONS,
  calculateConsultingQuote,
  formatQuoteCurrency,
  getEngagement,
  type ComplexityId,
  type ConsultingQuoteInputs,
  type EngagementTypeId,
  type ScopeModuleId,
  type SizeId,
} from "@/lib/consulting-quote";
import { useEffect, useMemo, useState } from "react";
import { draftQuoteProposal } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/20";

interface ProposalDraft {
  title: string;
  executiveSummary: string;
  situation: string;
  scope: string;
  approach: string;
  nextSteps: string;
}

export function QuoteBuilder() {
  const [inputs, setInputs] = useState<ConsultingQuoteInputs>(DEFAULT_QUOTE_INPUTS);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<ProposalDraft | null>(null);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = parseStored(window.localStorage.getItem(QUOTE_STORAGE_KEY));
    if (stored) setInputs(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs, ready]);

  const quote = useMemo(() => calculateConsultingQuote(inputs), [inputs]);

  function patch(partial: Partial<ConsultingQuoteInputs>) {
    setInputs((current) => ({ ...current, ...partial }));
  }

  function toggleModule(id: ScopeModuleId) {
    patch({
      modules: inputs.modules.includes(id)
        ? inputs.modules.filter((item) => item !== id)
        : [...inputs.modules, id],
    });
  }

  function applyEngagement(id: EngagementTypeId) {
    const engagement = getEngagement(id);
    patch({
      engagementType: id,
      weeks: engagement.weeks,
      principalDaysOverride: null,
      advisorDaysOverride: null,
      analystDaysOverride: null,
    });
  }

  async function handleDraft() {
    setStatus("loading");
    setError(null);
    const result = await draftQuoteProposal({
      organizationName: inputs.organizationName,
      contactName: inputs.contactName,
      organizationType: inputs.organizationType,
      engagementLabel: quote.engagementLabel,
      weeks: quote.weeks,
      modules: inputs.modules,
      notes: inputs.notes,
      feeLow: formatQuoteCurrency(quote.rangeLow),
      feeHigh: formatQuoteCurrency(quote.rangeHigh),
      feeTotal: formatQuoteCurrency(quote.total),
      retainers: quote.retainers.map(
        (tier) =>
          `${tier.label}: ${formatQuoteCurrency(tier.monthly)} / month · ${formatQuoteCurrency(tier.annual)} / ${tier.termMonths} months`,
      ),
    });
    setStatus("idle");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDraft(result);
  }

  function proposalText(): string {
    const org = inputs.organizationName || "[TO CONFIRM: organization]";
    const lines = [
      draft?.title || `Daedalus Health · ${quote.engagementLabel}`,
      org,
      "",
      draft?.executiveSummary ?? "",
      "",
      "Situation",
      draft?.situation ?? "",
      "",
      "Scope",
      draft?.scope ?? quote.engagementSummary,
      "",
      "Approach",
      draft?.approach ?? "",
      "",
      "Professional fees (planning)",
      ...quote.lines.map(
        (item) =>
          `${item.label}: ${item.days} days × ${formatQuoteCurrency(item.rate)} = ${formatQuoteCurrency(item.amount)}`,
      ),
      quote.travel
        ? `On-site / travel days: ${formatQuoteCurrency(quote.travel)}`
        : null,
      quote.contingency
        ? `Contingency (10%): ${formatQuoteCurrency(quote.contingency)}`
        : null,
      `Planning midpoint: ${formatQuoteCurrency(quote.total)}`,
      `Planning range: ${formatQuoteCurrency(quote.rangeLow)} – ${formatQuoteCurrency(quote.rangeHigh)}`,
      "",
      "Retainer options",
      ...quote.retainers.map(
        (tier) =>
          `${tier.label}: ${formatQuoteCurrency(tier.monthly)}/mo (${tier.termMonths} months) — ${tier.summary}`,
      ),
      "",
      "Assumptions",
      ...quote.assumptions.map((item) => `• ${item}`),
      "",
      "Next steps",
      draft?.nextSteps ??
        "Confirm scope, names, and dates. Daedalus Health will issue a short letter of engagement.",
    ];
    return lines.filter((item) => item !== null).join("\n");
  }

  async function copyProposal() {
    await navigator.clipboard.writeText(proposalText());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6 rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Scope of engagement
          </p>
          <h2 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
            Client and work
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Organization</span>
            <input
              value={inputs.organizationName}
              onChange={(event) => patch({ organizationName: event.target.value })}
              className={inputClass}
              placeholder="Meridian Health System"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Primary contact</span>
            <input
              value={inputs.contactName}
              onChange={(event) => patch({ contactName: event.target.value })}
              className={inputClass}
              placeholder="Jordan Ellis"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">
              Organization type
            </span>
            <select
              value={inputs.organizationType}
              onChange={(event) => patch({ organizationType: event.target.value })}
              className={inputClass}
            >
              <option>Hospital system</option>
              <option>Academic medical center</option>
              <option>Community hospital</option>
              <option>EMS / HEMS program</option>
              <option>Health plan / payer</option>
              <option>Physician group</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Scale</span>
            <select
              value={inputs.size}
              onChange={(event) => patch({ size: event.target.value as SizeId })}
              className={inputClass}
            >
              {SIZE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-[#1A2B3C]">
            Engagement archetype
          </legend>
          <div className="mt-3 grid gap-3">
            {ENGAGEMENT_TYPES.map((type) => (
              <label
                key={type.id}
                className={`flex cursor-pointer gap-3 rounded-sm border px-3.5 py-3 text-sm ${
                  inputs.engagementType === type.id
                    ? "border-[#C4A574] bg-[#C4A574]/10"
                    : "border-[#1A2B3C]/15"
                }`}
              >
                <input
                  type="radio"
                  name="engagement"
                  checked={inputs.engagementType === type.id}
                  onChange={() => applyEngagement(type.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-[#1A2B3C]">{type.label}</span>
                  <span className="mt-1 block text-[#1A2B3C]/65">
                    {type.summary}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-[#1A2B3C]">Complexity</span>
            <select
              value={inputs.complexity}
              onChange={(event) =>
                patch({ complexity: event.target.value as ComplexityId })
              }
              className={inputClass}
            >
              {COMPLEXITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="Duration (weeks)"
            value={inputs.weeks}
            onChange={(weeks) => patch({ weeks })}
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-[#1A2B3C]">
            Scope modules
          </legend>
          <div className="mt-3 grid gap-2">
            {SCOPE_MODULES.map((module) => (
              <label
                key={module.id}
                className="flex items-start gap-2.5 text-sm text-[#1A2B3C]"
              >
                <input
                  type="checkbox"
                  checked={inputs.modules.includes(module.id)}
                  onChange={() => toggleModule(module.id)}
                  className="mt-1"
                />
                <span>
                  {module.label}
                  <span className="block text-xs text-[#1A2B3C]/50">
                    +{module.days} {module.role} days
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Rate card
          </p>
          <p className="mt-2 text-xs leading-5 text-[#1A2B3C]/55">
            Planning defaults for independent healthcare advisory. Override
            before a customer sees the number.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Principal day rate"
              value={inputs.principalDayRate}
              onChange={(principalDayRate) => patch({ principalDayRate })}
              step="100"
            />
            <NumberField
              label="Advisor day rate"
              value={inputs.advisorDayRate}
              onChange={(advisorDayRate) => patch({ advisorDayRate })}
              step="100"
            />
            <NumberField
              label="Analyst day rate"
              value={inputs.analystDayRate}
              onChange={(analystDayRate) => patch({ analystDayRate })}
              step="50"
            />
            <NumberField
              label="Travel day add-on"
              value={inputs.travelDayRate}
              onChange={(travelDayRate) => patch({ travelDayRate })}
              step="50"
            />
            <NumberField
              label="On-site days"
              value={inputs.onsiteDays}
              onChange={(onsiteDays) => patch({ onsiteDays })}
            />
            <NumberField
              label="Principal days (override)"
              value={inputs.principalDaysOverride ?? quote.principalDays}
              onChange={(value) => patch({ principalDaysOverride: value })}
              step="0.5"
            />
            <NumberField
              label="Advisor days (override)"
              value={inputs.advisorDaysOverride ?? quote.advisorDays}
              onChange={(value) => patch({ advisorDaysOverride: value })}
              step="0.5"
            />
            <NumberField
              label="Analyst days (override)"
              value={inputs.analystDaysOverride ?? quote.analystDays}
              onChange={(value) => patch({ analystDaysOverride: value })}
              step="0.5"
            />
          </div>
          <label className="mt-4 flex items-start gap-2.5 text-sm text-[#1A2B3C]">
            <input
              type="checkbox"
              checked={inputs.includeContingency}
              onChange={(event) =>
                patch({ includeContingency: event.target.checked })
              }
              className="mt-1"
            />
            Include 10% contingency
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-[#1A2B3C]">
            Notes for the proposal draft
          </span>
          <textarea
            value={inputs.notes}
            onChange={(event) => patch({ notes: event.target.value })}
            rows={5}
            className={inputClass}
            placeholder="What they asked for, who is in the room, known vendors, timing constraints. Do not include PHI."
          />
        </label>
      </div>

      <div className="space-y-6">
        <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Professional fees
          </p>
          <h2 className="mt-2 font-serif text-xl font-medium text-[#1A2B3C]">
            {quote.engagementLabel}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/65">
            {quote.weeks} weeks · {quote.principalDays} principal days ·{" "}
            {quote.advisorDays} advisor days
          </p>
          <dl className="mt-6 space-y-2 text-sm">
            {quote.lines.map((item) => (
              <div key={item.label} className="flex justify-between gap-4">
                <dt className="text-[#1A2B3C]/70">
                  {item.label} · {item.days}d
                </dt>
                <dd className="font-medium text-[#1A2B3C]">
                  {formatQuoteCurrency(item.amount)}
                </dd>
              </div>
            ))}
            {quote.travel ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[#1A2B3C]/70">On-site / travel days</dt>
                <dd className="font-medium text-[#1A2B3C]">
                  {formatQuoteCurrency(quote.travel)}
                </dd>
              </div>
            ) : null}
            {quote.contingency ? (
              <div className="flex justify-between gap-4">
                <dt className="text-[#1A2B3C]/70">Contingency</dt>
                <dd className="font-medium text-[#1A2B3C]">
                  {formatQuoteCurrency(quote.contingency)}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-6 font-serif text-3xl text-[#1A2B3C]">
            {formatQuoteCurrency(quote.total)}
          </p>
          <p className="mt-1 text-sm text-[#1A2B3C]/60">
            Planning range {formatQuoteCurrency(quote.rangeLow)} –{" "}
            {formatQuoteCurrency(quote.rangeHigh)}
          </p>
        </section>

        <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Long-term retainers
          </p>
          <div className="mt-4 space-y-4">
            {quote.retainers.map((tier) => (
              <div
                key={tier.id}
                className="border-t border-[#1A2B3C]/10 pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg text-[#1A2B3C]">
                    {tier.label}
                  </h3>
                  <p className="text-sm font-medium text-[#1A2B3C]">
                    {formatQuoteCurrency(tier.monthly)} / month
                  </p>
                </div>
                <p className="mt-1 text-sm leading-6 text-[#1A2B3C]/65">
                  {tier.summary} {formatQuoteCurrency(tier.annual)} over{" "}
                  {tier.termMonths} months.
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] print:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C4A574]">
            Proposal draft
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleDraft()}
              disabled={status === "loading"}
              className="rounded-sm bg-[#C4A574] px-4 py-2.5 text-sm font-medium text-[#1A2B3C] transition hover:bg-[#d4b888] disabled:opacity-60"
            >
              {status === "loading" ? "Drafting…" : "Draft with OpenAI"}
            </button>
            <button
              type="button"
              onClick={() => void copyProposal()}
              className="rounded-sm border border-[#C4A574] px-4 py-2.5 text-sm font-medium text-[#C4A574] transition hover:bg-[#C4A574] hover:text-[#1A2B3C]"
            >
              {copied ? "Copied" : "Copy proposal"}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-sm border border-[#1A2B3C]/20 px-4 py-2.5 text-sm font-medium text-[#1A2B3C] transition hover:border-[#C4A574]"
            >
              Print
            </button>
          </div>
          {error ? (
            <p className="mt-4 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <div className="mt-6 space-y-4 text-sm leading-6 text-[#1A2B3C]/80">
            <h3 className="font-serif text-2xl font-medium text-[#1A2B3C]">
              {draft?.title ||
                `${quote.engagementLabel} for ${inputs.organizationName || "the organization"}`}
            </h3>
            {draft ? (
              <>
                <p>{draft.executiveSummary}</p>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
                    Situation
                  </p>
                  <p className="mt-2">{draft.situation}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
                    Scope
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{draft.scope}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
                    Approach
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{draft.approach}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
                    Next steps
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{draft.nextSteps}</p>
                </div>
              </>
            ) : (
              <p>
                {quote.engagementSummary} Use Draft with OpenAI to tailor the
                narrative, or copy the fee table as a working quote.
              </p>
            )}
            <ul className="list-disc space-y-1 pl-5 text-[#1A2B3C]/65">
              {quote.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = "1",
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#1A2B3C]">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
        className={inputClass}
      />
    </label>
  );
}

function parseStored(raw: string | null): ConsultingQuoteInputs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsultingQuoteInputs>;
    const modules = Array.isArray(parsed.modules)
      ? parsed.modules.filter((item): item is ScopeModuleId =>
          SCOPE_MODULES.some((module) => module.id === item),
        )
      : DEFAULT_QUOTE_INPUTS.modules;
    return {
      ...DEFAULT_QUOTE_INPUTS,
      ...parsed,
      modules,
    };
  } catch {
    return null;
  }
}
