import { getOrgAccess } from "@/lib/org-access";
import { isOrgAdminRole, listOrgMembers } from "@/lib/org-membership";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TeamInviteForm } from "./team-invite-form";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

export const metadata: Metadata = {
  title: "Team",
};

export default async function TeamPage({ params }: PageProps) {
  const { orgSlug } = await params;
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    redirect("/login");
  }

  let membersClient;
  try {
    membersClient = createAdminClient();
  } catch {
    membersClient = await createClient();
  }

  const members = await listOrgMembers(membersClient, access.org.id);
  const canInvite = isOrgAdminRole(access.role);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold tracking-[0.22em] text-[#C4A574]">
        PARTNER PORTAL
      </p>
      <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#F9F8F3] sm:text-4xl">
        Team
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#F9F8F3]/70">
        People with access to {access.org.name}. The same person can belong to
        more than one organization.
      </p>

      <div className="mt-8 overflow-hidden rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[#1A2B3C]/10 bg-[#F7F5F0] text-xs font-semibold uppercase tracking-[0.14em] text-[#1A2B3C]/55">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-6 text-[#1A2B3C]/60">
                  No teammates have been added yet.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-[#1A2B3C]/8 text-[#1A2B3C]"
                >
                  <td className="px-5 py-3">
                    {member.fullName || "Name not recorded"}
                  </td>
                  <td className="px-5 py-3 capitalize text-[#1A2B3C]/70">
                    {member.role}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canInvite ? (
        <div className="mt-8">
          <TeamInviteForm orgSlug={access.org.slug} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-[#F9F8F3]/60">
          Ask this organization&rsquo;s main contact if you need someone else
          added.
        </p>
      )}
    </div>
  );
}
