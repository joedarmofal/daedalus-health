import { TopographicPattern } from "@/components/topographic-pattern";
import { getOrgAccess } from "@/lib/org-access";
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
      "Model inventory, governance status, and program telemetry at a glance.",
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
      "Templates and checklists to operationalize risk assessment, validation, and monitoring.",
  },
];

export default async function OrgPortalPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org, role, user } = access;

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
