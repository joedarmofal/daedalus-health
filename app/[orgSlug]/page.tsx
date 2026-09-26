import { TopographicPattern } from "@/components/topographic-pattern";
import { getOrgAccess } from "@/lib/org-access";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const SECTION_CARDS = [
  {
    href: "dashboard",
    label: "Dashboard",
    description:
      "Governance status, program telemetry, and an ROI tool for time and money returned.",
  },
  {
    href: "policy",
    label: "Policy",
    description:
      "The governing policy library for AI use, data privacy, and vendor risk.",
  },
  {
    href: "governance",
    label: "Governance",
    description:
      "Oversight structure, review cadence, and escalation pathways for your program.",
  },
  {
    href: "toolkit",
    label: "Toolkit",
    description:
      "Templates, checklists, and an enterprise AI tools directory to evaluate vendors.",
  },
  {
    href: "legal",
    label: "Legal / Compliance",
    description:
      "AI laws, common compliance situations, and a live feed of legal and regulatory news.",
  },
];

export default async function OrgPortalPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org, role, user } = access;

  const supabase = await createClient();
  const { data: intake } = await supabase
    .from("organization_intake")
    .select("organization_id")
    .eq("organization_id", org.id)
    .maybeSingle();

  return (
    <div className="relative">
      <TopographicPattern
        tone="slate"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.22em] text-[#1F6A64]">
          CLIENT PORTAL
        </p>
        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#1A2B3C] sm:text-4xl">
          {org.name}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#1A2B3C]/70">
          Welcome back, {user.email}. Your executive workspace covers AI
          governance, clinical validation, and program transparency for{" "}
          {org.name}.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C4A574]/50 bg-[#C4A574]/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#1A2B3C]/80">
          Role
          <span className="font-semibold text-[#1F6A64]">{role}</span>
        </div>

        {!intake ? (
          <Link
            href={`/${org.slug}/intake`}
            className="mt-8 flex flex-col gap-3 rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 p-5 transition hover:border-[#C4A574] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#1A2B3C]">
                Finish setting up {org.name}
              </p>
              <p className="mt-1 text-sm leading-6 text-[#1A2B3C]/70">
                A few quick details about your organization help us configure
                your governance program correctly — about three minutes.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center justify-center rounded-sm bg-[#1F6A64] px-5 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition group-hover:bg-[#1A2B3C]">
              Complete setup →
            </span>
          </Link>
        ) : null}

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SECTION_CARDS.map((section) => (
            <Link
              key={section.href}
              href={`/${org.slug}/${section.href}`}
              className="group rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] transition hover:border-[#C4A574]/60 hover:shadow-[0_24px_60px_-30px_rgba(26,43,60,0.55)]"
            >
              <h2 className="font-serif text-lg font-medium text-[#1A2B3C] transition group-hover:text-[#1F6A64]">
                {section.label}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#1A2B3C]/70">
                {section.description}
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-[#1F6A64]">
                Open {section.label}
                <span
                  aria-hidden="true"
                  className="ml-1.5 transition group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
