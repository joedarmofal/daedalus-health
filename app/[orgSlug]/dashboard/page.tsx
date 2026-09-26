import { TopographicPattern } from "@/components/topographic-pattern";
import { getOrgAccess } from "@/lib/org-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoiCalculator } from "./roi-calculator";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function TenantDashboardPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org, role } = access;

  const stats = [
    {
      label: "Active AI Models",
      value: "0",
      note: "All systems operational",
    },
    {
      label: "Governance Status",
      value: "Compliant",
      note: "Ethics board active",
    },
    {
      label: "Assigned Role",
      value: role,
      note: "Access scoped to your organization",
      capitalize: true,
    },
  ];

  return (
    <div className="relative">
      <TopographicPattern
        tone="slate"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-8 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
            Ethical Governance Dashboard
          </span>
          <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
            {org.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
            Monitor governance status, then quantify how much time and money
            your AI program is returning to {org.name}.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]"
            >
              <div className="text-xs font-medium text-[#1A2B3C]/60">
                {stat.label}
              </div>
              <div
                className={`mt-1 text-2xl font-semibold text-[#1A2B3C] ${
                  stat.capitalize ? "capitalize" : ""
                }`}
              >
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-[#1F6A64]">{stat.note}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <RoiCalculator orgSlug={org.slug} />
        </div>
      </div>
    </div>
  );
}
