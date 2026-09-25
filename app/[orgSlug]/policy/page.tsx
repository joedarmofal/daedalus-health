import { getOrgAccess } from "@/lib/org-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Policy",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

interface Policy {
  name: string;
  category: string;
  status: "Active" | "Under Review" | "Draft";
  updated: string;
  summary: string;
}

const POLICIES: Policy[] = [
  {
    name: "AI Use & Acceptable Use Policy",
    category: "Governance",
    status: "Active",
    updated: "2026-06-01",
    summary:
      "Approved use cases, prohibited applications, and escalation paths for clinical and administrative AI systems.",
  },
  {
    name: "Data Privacy & Security Policy",
    category: "Privacy",
    status: "Active",
    updated: "2026-05-15",
    summary:
      "PHI handling, de-identification standards, and vendor data-processing requirements for AI tooling.",
  },
  {
    name: "Model Risk Management Policy",
    category: "Risk",
    status: "Active",
    updated: "2026-04-22",
    summary:
      "Risk tiering, validation thresholds, and revalidation cadence for deployed models.",
  },
  {
    name: "Clinical Validation & Safety Policy",
    category: "Clinical",
    status: "Under Review",
    updated: "2026-08-30",
    summary:
      "Required evidence, clinician sign-off, and ongoing monitoring for models touching clinical decision-making.",
  },
  {
    name: "Third-Party & Vendor AI Policy",
    category: "Risk",
    status: "Active",
    updated: "2026-03-10",
    summary:
      "Due diligence, contractual safeguards, and audit rights for external AI vendors and embedded AI features.",
  },
  {
    name: "Incident Response Policy",
    category: "Governance",
    status: "Active",
    updated: "2026-02-18",
    summary:
      "Reporting, containment, and disclosure obligations when an AI system causes or risks harm.",
  },
];

const STATUS_STYLES: Record<Policy["status"], string> = {
  Active: "border-[#1F6A64]/40 bg-[#1F6A64]/10 text-[#1F6A64]",
  "Under Review": "border-[#C4A574]/50 bg-[#C4A574]/15 text-[#8a6d3d]",
  Draft: "border-[#1A2B3C]/20 bg-[#1A2B3C]/5 text-[#1A2B3C]/70",
};

export default async function PolicyPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org } = access;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Policy Library
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Governing policies for {org.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        The active policy set governing AI use, data handling, and vendor
        risk across your organization. Full policy documents are issued to
        designated administrators; request a copy below.
      </p>

      <div className="mt-8 space-y-4">
        {POLICIES.map((policy) => (
          <div
            key={policy.name}
            className="flex flex-col gap-4 rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.35)] sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-lg font-medium text-[#1A2B3C]">
                  {policy.name}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_STYLES[policy.status]}`}
                >
                  {policy.status}
                </span>
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#1A2B3C]/45">
                {policy.category} · Updated{" "}
                {new Date(policy.updated).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#1A2B3C]/70">
                {policy.summary}
              </p>
            </div>

            <a
              href={`mailto:briefings@daedalus.health?subject=${encodeURIComponent(
                `Policy Document Request: ${policy.name} (${org.name})`,
              )}`}
              className="inline-flex shrink-0 items-center justify-center rounded-sm border border-[#1A2B3C]/25 px-4 py-2 text-sm font-medium text-[#1A2B3C] transition hover:border-[#1F6A64] hover:text-[#1F6A64]"
            >
              Request document
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
