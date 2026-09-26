import { fetchAiVendorDirectory } from "@/lib/ai-vendors";
import { getOrgAccess } from "@/lib/org-access";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Toolkit",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

interface ToolkitItem {
  name: string;
  phase: "Assess" | "Validate" | "Monitor" | "Respond";
  description: string;
}

const TOOLKIT: ToolkitItem[] = [
  {
    name: "AI Risk Assessment Template",
    phase: "Assess",
    description:
      "Structured intake for scoring a proposed AI use case on data sensitivity, clinical impact, and autonomy.",
  },
  {
    name: "Vendor Due Diligence Checklist",
    phase: "Assess",
    description:
      "Security, privacy, and model-transparency questions to run before signing any third-party AI vendor.",
  },
  {
    name: "Clinical Validation Checklist",
    phase: "Validate",
    description:
      "Evidence requirements and clinician sign-off steps for models involved in diagnosis or treatment decisions.",
  },
  {
    name: "Model Card Template",
    phase: "Validate",
    description:
      "Standard documentation of a model's intended use, training data, limitations, and performance benchmarks.",
  },
  {
    name: "Monitoring & Drift Review Checklist",
    phase: "Monitor",
    description:
      "Recurring checks for performance degradation, data drift, and fairness across deployed models.",
  },
  {
    name: "Incident Report Template",
    phase: "Respond",
    description:
      "Standard form for logging, triaging, and escalating an AI-related safety or privacy incident.",
  },
  {
    name: "Post-Incident Review Template",
    phase: "Respond",
    description:
      "Root-cause analysis and corrective-action tracking once an incident has been contained.",
  },
];

const PHASES: ToolkitItem["phase"][] = ["Assess", "Validate", "Monitor", "Respond"];

const PHASE_STYLES: Record<ToolkitItem["phase"], string> = {
  Assess: "border-[#1F6A64]/40 bg-[#1F6A64]/10 text-[#1F6A64]",
  Validate: "border-[#C4A574]/50 bg-[#C4A574]/15 text-[#8a6d3d]",
  Monitor: "border-[#1A2B3C]/25 bg-[#1A2B3C]/5 text-[#1A2B3C]/75",
  Respond: "border-red-800/25 bg-red-50 text-red-800",
};

export default async function ToolkitPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org } = access;
  const vendorCount = (await fetchAiVendorDirectory()).reduce(
    (sum, category) => sum + category.tools.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Governance Toolkit
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Operational templates for {org.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Practical templates and checklists that turn policy into practice
        across each stage of the model lifecycle, plus a directory of
        enterprise AI tools to evaluate.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
          AI Tools
        </h2>
        <Link
          href={`/${org.slug}/toolkit/ai-tools`}
          className="mt-5 flex flex-col gap-3 rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 p-6 transition hover:border-[#C4A574] sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-serif text-lg font-medium text-[#1A2B3C]">
              Enterprise AI directory
            </p>
            <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
              {vendorCount} respected vendors, grouped by ambient scribes,
              imaging, research, HR, legal, revenue cycle, and more — a
              shopping list for {org.name} to explore enterprise-wide.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[#1A2B3C] px-5 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3]">
            Open AI Tools →
          </span>
        </Link>
      </section>

      {PHASES.map((phase) => {
        const items = TOOLKIT.filter((item) => item.phase === phase);
        if (items.length === 0) return null;

        return (
          <section key={phase} className="mt-10">
            <h2 className="font-serif text-xl font-medium text-[#1A2B3C]">
              {phase}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.name}
                  className="flex flex-col rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)]"
                >
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${PHASE_STYLES[item.phase]}`}
                  >
                    {item.phase}
                  </span>
                  <h3 className="mt-3 font-serif text-lg font-medium text-[#1A2B3C]">
                    {item.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#1A2B3C]/70">
                    {item.description}
                  </p>
                  <a
                    href={`mailto:briefings@daedalus.health?subject=${encodeURIComponent(
                      `Toolkit Template Request: ${item.name} (${org.name})`,
                    )}`}
                    className="mt-4 inline-flex w-fit items-center text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
                  >
                    Request template
                    <span aria-hidden="true" className="ml-1.5">
                      →
                    </span>
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
