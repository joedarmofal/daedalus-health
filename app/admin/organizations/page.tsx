import { getAdminAccess } from "@/lib/admin-access";
import { customerMailFromAddress } from "@/lib/mail";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewCustomerForm } from "./new-customer-form";
import { OrganizationRow, type OrganizationRowData } from "./organization-row";

export const metadata: Metadata = {
  title: "Admin · Organizations",
};

export default async function AdminOrganizationsPage() {
  const access = await getAdminAccess();

  if (access.status !== "ok") {
    redirect("/admin");
  }

  const supabase = await createClient();

  const [{ data: orgs }, membersResult, { data: intakes }] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name, slug, primary_contact_email")
      .order("name", { ascending: true }),
    supabase.from("organization_members").select("organization_id, full_name"),
    supabase.from("organization_intake").select("organization_id"),
  ]);

  const members = membersResult.error
    ? (await supabase.from("organization_members").select("organization_id")).data
    : membersResult.data;

  const memberCounts = new Map<string, number>();
  const memberNames = new Map<string, string[]>();
  for (const member of members ?? []) {
    memberCounts.set(
      member.organization_id,
      (memberCounts.get(member.organization_id) ?? 0) + 1,
    );
    const fullName =
      "full_name" in member && typeof member.full_name === "string"
        ? member.full_name.trim()
        : "";
    if (fullName) {
      const names = memberNames.get(member.organization_id) ?? [];
      if (!names.includes(fullName)) names.push(fullName);
      memberNames.set(member.organization_id, names);
    }
  }

  const intakeCompleted = new Set((intakes ?? []).map((i) => i.organization_id));

  const rows: OrganizationRowData[] = (orgs ?? []).map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    primaryContactEmail: org.primary_contact_email ?? null,
    memberNames: memberNames.get(org.id) ?? [],
    memberCount: memberCounts.get(org.id) ?? 0,
    intakeCompleted: intakeCompleted.has(org.id),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1F6A64]">
        Admin
      </span>
      <h1 className="mt-2 font-serif text-3xl font-medium text-[#1A2B3C]">
        Organizations
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#1A2B3C]/70">
        Create new customer organizations. A welcome email goes out from{" "}
        {customerMailFromAddress()} with their sign-in link.
      </p>

      <div className="mt-8">
        <NewCustomerForm fromEmail={customerMailFromAddress()} />
      </div>

      <h2 className="mt-12 font-serif text-xl font-medium text-[#1A2B3C]">
        All organizations ({rows.length})
      </h2>
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <p className="text-sm text-[#1A2B3C]/60">
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
