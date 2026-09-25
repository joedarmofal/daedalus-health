import { getOrgAccess } from "@/lib/org-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Governance",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const METRICS = [
  { label: "Models under oversight", value: "0" },
  { label: "Reviews completed this quarter", value: "0" },
  { label: "Open escalations", value: "0" },
  { label: "Next board review", value: "Not scheduled" },
];

const BODIES = [
  {
    name: "Ethics & Safety Board",
    cadence: "Quarterly",
    charter:
      "Sets ethical guardrails for AI deployment and reviews program-level risk against the SHIELD principles: Safety, Humanity, Integrity, Excellence, Longevity, Duty.",
  },
  {
    name: "AI Governance Committee",
    cadence: "Monthly",
    charter:
      "Approves new AI use cases, assigns risk tiers, and tracks policy compliance across departments.",
  },
  {
    name: "Clinical Safety Review",
    cadence: "Per model, before go-live",
    charter:
      "Clinician-led validation of any model that touches diagnosis, triage, or treatment recommendations before it reaches production.",
  },
];

const LIFECYCLE = [
  {
    stage: "Propose",
    detail: "Use case submitted with intended purpose, data sources, and affected population.",
  },
  {
    stage: "Assess",
    detail: "Risk tier assigned; privacy, security, and clinical safety review scoped accordingly.",
  },
  {
    stage: "Validate",
    detail: "Evidence of accuracy, fairness, and safety reviewed and signed off before deployment.",
  },
  {
    stage: "Monitor",
    detail: "Ongoing performance, drift, and incident monitoring against defined thresholds.",
  },
  {
    stage: "Retire or Revalidate",
    detail: "Models are revalidated on a fixed cadence or retired when they no longer meet standards.",
  },
];

export default async function GovernancePage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org } = access;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Governance Oversight
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        How {org.name} keeps humans at the controls
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        The oversight structure, review cadence, and escalation pathways that
        govern every AI system deployed within your organization.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]"
          >
            <div className="text-xs font-medium text-[#1A2B3C]/60">
              {metric.label}
            </div>
            <div className="mt-1 text-2xl font-semibold text-[#1A2B3C]">
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-serif text-xl font-medium text-[#1A2B3C]">
        Oversight bodies
      </h2>
      <div className="mt-5 space-y-4">
        {BODIES.map((body) => (
          <div
            key={body.name}
            className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-lg font-medium text-[#1A2B3C]">
                {body.name}
              </h3>
              <span className="inline-flex items-center rounded-full border border-[#C4A574]/50 bg-[#C4A574]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-[#8a6d3d]">
                {body.cadence}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
              {body.charter}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-serif text-xl font-medium text-[#1A2B3C]">
        Model lifecycle
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {LIFECYCLE.map((step, index) => (
          <div
            key={step.stage}
            className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-5 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]"
          >
            <div className="text-xs font-semibold text-[#1F6A64]">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className="mt-1 font-serif text-base font-medium text-[#1A2B3C]">
              {step.stage}
            </div>
            <p className="mt-2 text-xs leading-5 text-[#1A2B3C]/65">
              {step.detail}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
