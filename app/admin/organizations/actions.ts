"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { inviteUserToOrganization } from "@/lib/invite-member";
import { isReservedOrgSlug } from "@/lib/org";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface OrgActionResult {
  ok: boolean;
  error?: string;
  inviteLink?: string;
  orgSlug?: string;
  emailSent?: boolean;
  emailedTo?: string;
}

export async function createOrganizationAndInvite(
  formData: FormData,
): Promise<OrgActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const contactEmail = String(formData.get("contactEmail") ?? "")
    .trim()
    .toLowerCase();
  const contactName = String(formData.get("contactName") ?? "").trim();

  if (!name || !slug || !contactEmail || !contactName) {
    return {
      ok: false,
      error: "Organization name, slug, contact name, and contact email are required.",
    };
  }

  if (!SLUG_PATTERN.test(slug) || isReservedOrgSlug(slug)) {
    return {
      ok: false,
      error: "Slug must be lowercase letters, numbers, and hyphens only, and cannot be a reserved path.",
    };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Admin client is not configured.",
    };
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name,
      slug,
      primary_contact_email: contactEmail,
      created_by: access.user.id,
    })
    .select("id, slug, name")
    .single();

  if (orgError || !org) {
    return {
      ok: false,
      error:
        orgError?.code === "23505"
          ? `The slug "${slug}" is already in use.`
          : orgError?.message ?? "Could not create the organization.",
    };
  }

  const linkResult = await inviteUserToOrganization(
    admin,
    { id: org.id, slug: org.slug, name: org.name ?? name },
    contactEmail,
    contactName,
    "admin",
    "welcome",
  );

  revalidatePath("/admin/organizations");

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error, orgSlug: org.slug };
  }

  return {
    ok: true,
    inviteLink: linkResult.inviteLink,
    orgSlug: org.slug,
    emailSent: linkResult.emailSent,
    emailedTo: contactEmail,
    error: linkResult.emailSent
      ? undefined
      : linkResult.error ?? "The welcome email could not be sent.",
  };
}

export async function resendInviteLink(
  orgId: string,
  email: string,
  fullName: string,
): Promise<OrgActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return { ok: false, error: "A contact email is required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Admin client is not configured.",
    };
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    return { ok: false, error: orgError?.message ?? "Organization not found." };
  }

  let resolvedName = fullName.trim();
  if (!resolvedName) {
    const { data: member } = await admin
      .from("organization_members")
      .select("full_name")
      .eq("organization_id", org.id)
      .not("full_name", "is", null)
      .limit(1)
      .maybeSingle();
    resolvedName = member?.full_name?.trim() ?? "";
  }

  const linkResult = await inviteUserToOrganization(
    admin,
    org,
    normalizedEmail,
    resolvedName,
    "admin",
    "welcome",
  );

  revalidatePath("/admin/organizations");

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error };
  }

  return {
    ok: true,
    inviteLink: linkResult.inviteLink,
    emailSent: linkResult.emailSent,
    emailedTo: normalizedEmail,
    error: linkResult.emailSent
      ? undefined
      : linkResult.error ?? "The welcome email could not be sent.",
  };
}

export async function addOrganizationMember(
  orgId: string,
  email: string,
  fullName: string,
): Promise<OrgActionResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const resolvedName = fullName.trim();
  if (!normalizedEmail || !resolvedName) {
    return { ok: false, error: "Name and email are required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Admin client is not configured.",
    };
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    return { ok: false, error: orgError?.message ?? "Organization not found." };
  }

  const linkResult = await inviteUserToOrganization(
    admin,
    org,
    normalizedEmail,
    resolvedName,
    "member",
    "teammate",
  );

  revalidatePath("/admin/organizations");
  revalidatePath(`/${org.slug}`);
  revalidatePath(`/${org.slug}/team`);

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error };
  }

  return {
    ok: true,
    inviteLink: linkResult.inviteLink,
    orgSlug: org.slug,
    emailSent: linkResult.emailSent,
    emailedTo: normalizedEmail,
    error: linkResult.emailSent
      ? undefined
      : linkResult.error ?? "The invite email could not be sent.",
  };
}
