import { getAdminAccess } from "@/lib/admin-access";
import { customerMailFromAddress } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewCustomerForm } from "./new-customer-form";
import {
  OrganizationRow,
  type OrganizationMemberOption,
  type OrganizationRowData,
} from "./organization-row";

async function loadAuthUsersById() {
  const admin = createAdminClient();
  const byId = new Map<string, User>();
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    for (const user of data.users) {
      byId.set(user.id, user);
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return byId;
}

function memberDisplayName(
  fullName: string,
  user: User | undefined,
): string {
  if (fullName) return fullName;
  const metaName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  if (metaName) return metaName;
  if (user?.email) return user.email;
  return "Name not recorded";
}

export const metadata: Metadata = {
  title: "Admin · Organizations",
};

export default async function AdminOrganizationsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/admin");
  }

  const supabase = await createClient();
  let admin = null;
  try {
    admin = createAdminClient();
  } catch {
    admin = null;
  }
  const membersClient = admin ?? supabase;

  const [{ data: orgs }, membersResult, { data: intakes }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, primary_contact_email")
      .order("name", { ascending: true }),
    membersClient
      .from("organization_members")
      .select("organization_id, user_id, full_name, role"),
    supabase.from("organization_intake").select("organization_id"),
  ]);

  const members = membersResult.error
    ? (
        await membersClient
          .from("organization_members")
          .select("organization_id, user_id, role")
      ).data
    : membersResult.data;

  const authUsers = admin ? await loadAuthUsersById() : new Map<string, User>();

  const membersByOrg = new Map<string, OrganizationMemberOption[]>();
  for (const member of members ?? []) {
    const fullName =
      "full_name" in member && typeof member.full_name === "string"
        ? member.full_name.trim()
        : "";
    const user = authUsers.get(member.user_id);
    const list = membersByOrg.get(member.organization_id) ?? [];
    list.push({
      name: memberDisplayName(fullName, user),
      email: user?.email ?? null,
      role: typeof member.role === "string" ? member.role : null,
    });
    membersByOrg.set(member.organization_id, list);
  }

  for (const list of membersByOrg.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const intakeCompleted = new Set((intakes ?? []).map((i) => i.organization_id));

  const rows: OrganizationRowData[] = (orgs ?? []).map((org) => {
    const orgMembers = membersByOrg.get(org.id) ?? [];
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      primaryContactEmail: org.primary_contact_email ?? null,
      members: orgMembers,
      memberNames: orgMembers
        .map((member) => member.name)
        .filter((name) => name !== "Name not recorded"),
      memberCount: orgMembers.length,
      intakeCompleted: intakeCompleted.has(org.id),
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C4A574]">
        Admin
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#F9F8F3]">
        Organizations
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#F9F8F3]/70">
        Create new customer organizations. A welcome email goes out from{" "}
        {customerMailFromAddress()} with their sign-in link.
      </p>

      <div className="mt-8">
        <NewCustomerForm fromEmail={customerMailFromAddress()} />
      </div>

      <h2 className="mt-12 font-serif text-xl font-medium text-[#F9F8F3]">
        All organizations ({rows.length})
      </h2>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-[#F9F8F3]/60">
            No organizations yet — create your first one above.
          </p>
        ) : (
          rows.map((org) => (
            <OrganizationRow
              key={org.id}
              org={org}
              fromEmail={customerMailFromAddress()}
            />
          ))
        )}
      </div>
    </div>
  );
}
