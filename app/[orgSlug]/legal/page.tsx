import { getOrgAccess } from "@/lib/org-access";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ComplianceExplorer } from "./compliance-explorer";
import { LegalNewsFeed } from "./news-feed";

export const metadata: Metadata = {
  title: "Legal & Compliance",
};

export default async function LegalCompliancePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);
  if (access.status === "unauthenticated") {
    redirect(`/login?next=/${orgSlug}/legal`);
  }
  if (access.status !== "ok") {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
        Partner Portal
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        Legal & Compliance
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F9F8F3]/70">
        A working reference for AI laws and common healthcare compliance
        situations, plus recent public headlines. This is not legal advice.
        Confirm requirements with counsel before acting.
      </p>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-medium text-[#F9F8F3]">
          Laws and situations
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F9F8F3]/65">
          Pick a situation your program is in — ambient scribing, clinical
          decision support, patient-facing chat, or cross-border vendors — to
          see the frameworks that usually apply.
        </p>
        <div className="mt-6">
          <ComplianceExplorer />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-medium text-[#F9F8F3]">
          AI legal and compliance news
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F9F8F3]/65">
          Headlines from public RSS sources, refreshed about every 30 minutes.
          Open the original article for the full story.
        </p>
        <div className="mt-6">
          <LegalNewsFeed />
        </div>
      </section>
    </div>
  );
}
