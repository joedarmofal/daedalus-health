"use client";

import {
  DEFAULT_ROI_INPUTS,
  calculateRoi,
  formatCurrency,
  formatFte,
  formatHours,
  formatMonths,
  formatPercent,
  type RoiInputs,
} from "@/lib/roi";
import { useEffect, useMemo, useState } from "react";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

const FIELD_META: {
  key: keyof RoiInputs;
  label: string;
  hint: string;
  step: string;
}[] = [
  {
    key: "people",
    label: "People affected",
    hint: "Clinicians, nurses, or staff whose time is returned",
    step: "1",
  },
  {
    key: "minutesSavedPerPersonPerDay",
    label: "Minutes saved per person per day",
    hint: "Documentation, prior auth, inbox, or handoff time",
    step: "1",
  },
  {
    key: "workingDaysPerYear",
    label: "Working days per year",
    hint: "Typical clinical year is 220–230 days",
    step: "1",
  },
  {
    key: "hourlyRate",
    label: "Fully loaded hourly cost ($)",
    hint: "Salary, benefits, and overhead for the affected role",
    step: "1",
  },
  {
    key: "additionalAnnualSavings",
    label: "Other annual cash savings ($)",
    hint: "Overtime, locums, denials, or vendor spend avoided",
    step: "1000",
  },
  {
    key: "annualInvestment",
    label: "Annual program investment ($)",
    hint: "AI tools, implementation, and Daedalus support",
    step: "1000",
  },
];

function storageKey(orgSlug: string) {
  return `daedalus-roi:${orgSlug}`;
}

function parseStored(raw: string | null): RoiInputs | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<RoiInputs>;
    return {
      people: Number(parsed.people) || 0,
      minutesSavedPerPersonPerDay:
        Number(parsed.minutesSavedPerPersonPerDay) || 0,
      workingDaysPerYear: Number(parsed.workingDaysPerYear) || 0,
      hourlyRate: Number(parsed.hourlyRate) || 0,
      additionalAnnualSavings: Number(parsed.additionalAnnualSavings) || 0,
      annualInvestment: Number(parsed.annualInvestment) || 0,
    };
  } catch {
    return null;
  }
}

export function RoiCalculator({ orgSlug }: { orgSlug: string }) {
  const [inputs, setInputs] = useState<RoiInputs>(DEFAULT_ROI_INPUTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = parseStored(window.localStorage.getItem(storageKey(orgSlug)));
    if (stored) {
      setInputs(stored);
    }
    setHydrated(true);
  }, [orgSlug]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(orgSlug), JSON.stringify(inputs));
  }, [hydrated, inputs, orgSlug]);

  const result = useMemo(() => calculateRoi(inputs), [inputs]);

  function updateField(key: keyof RoiInputs, raw: string) {
    const next = raw === "" ? 0 : Number(raw);
    setInputs((current) => ({
      ...current,
      [key]: Number.isFinite(next) ? next : 0,
    }));
  }

  return (
    <section className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        ROI tool
      </span>
      <h2 className="mt-2 font-serif text-2xl font-medium text-[#1A2B3C]">
        Time and money returned
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1A2B3C]/70">
        Quantify productivity hours given back to care, then convert that time
        into labor savings and financial ROI against your annual program cost.
        Figures stay in this browser for {orgSlug}.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELD_META.map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-medium text-[#1A2B3C]">
                {field.label}
              </span>
              <input
                type="number"
                min={0}
                step={field.step}
                value={inputs[field.key] === 0 ? "" : inputs[field.key]}
                onChange={(event) => updateField(field.key, event.target.value)}
                className={inputClass}
              />
              <span className="mt-1.5 block text-xs leading-5 text-[#1A2B3C]/50">
                {field.hint}
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ResultCard
              label="Hours returned / year"
              value={formatHours(result.annualHoursSaved)}
              note={`${formatFte(result.fteEquivalent)} FTE equivalent`}
            />
            <ResultCard
              label="Labor dollars saved"
              value={formatCurrency(result.laborSavings)}
              note="Time × fully loaded hourly cost"
            />
            <ResultCard
              label="Net annual value"
              value={formatCurrency(result.netValue)}
              note={
                result.netValue >= 0
                  ? "Benefit minus program investment"
                  : "Investment currently exceeds benefit"
              }
              emphasis={result.netValue >= 0 ? "positive" : "caution"}
            />
            <ResultCard
              label="Financial ROI"
              value={
                result.roiPercent === null
                  ? "—"
                  : formatPercent(result.roiPercent)
              }
              note={
                result.paybackMonths === null
                  ? "Enter an annual investment to see payback"
                  : `Payback in ${formatMonths(result.paybackMonths)}`
              }
              emphasis={
                result.roiPercent !== null && result.roiPercent >= 0
                  ? "positive"
                  : "caution"
              }
            />
          </div>

          <p className="text-xs leading-5 text-[#1A2B3C]/50">
            Hours = people × minutes per day × working days ÷ 60. Labor savings
            = hours × hourly cost. ROI = (total benefit − investment) ÷
            investment. One FTE is treated as 2,080 hours.
          </p>
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  label,
  value,
  note,
  emphasis,
}: {
  label: string;
  value: string;
  note: string;
  emphasis?: "positive" | "caution";
}) {
  const valueClass =
    emphasis === "positive"
      ? "text-[#1F6A64]"
      : emphasis === "caution"
        ? "text-[#8a6d3d]"
        : "text-[#1A2B3C]";

  return (
    <div className="rounded-sm border border-[#1A2B3C]/10 bg-[#F7F5F0] p-4">
      <div className="text-xs font-medium text-[#1A2B3C]/55">{label}</div>
      <div className={`mt-1 font-serif text-2xl font-medium ${valueClass}`}>
        {value}
      </div>
      <div className="mt-1 text-xs leading-5 text-[#1A2B3C]/50">{note}</div>
    </div>
  );
}
