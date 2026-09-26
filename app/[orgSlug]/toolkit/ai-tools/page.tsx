import { getOrgAccess } from "@/lib/org-access";
import { countAiTools } from "@/lib/ai-tools-directory";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AiToolsDirectory } from "./directory";

export const metadata: Metadata = {
  title: "AI Tools",
};

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export default async function AiToolsPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  const { org } = access;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href={`/${org.slug}/toolkit`}
        className="text-sm font-medium text-[#1F6A64] hover:text-[#1A2B3C]"
      >
        ← Governance Toolkit
      </Link>
      <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        AI Tools
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Enterprise AI directory for {org.name}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        A working list of {countAiTools()} established vendors across ambient
        documentation, imaging, revenue cycle, operations, research, HR, and
        legal. Use it to shop categories, then run every shortlist through your
        vendor due-diligence checklist.
      </p>
      <p className="mt-3 max-w-2xl text-xs leading-5 text-[#1A2B3C]/50">
        This is an independent resource, not an endorsement or paid placement.
        Capabilities change; confirm current FDA status, BAAs, and EHR
        integration before a procurement conversation.
      </p>

      <div className="mt-8">
        <AiToolsDirectory />
      </div>
    </div>
  );
}
