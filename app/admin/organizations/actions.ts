"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { isReservedOrgSlug } from "@/lib/org";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const SITE_URL =
  process.env.NODE_ENV === "production"
    ? "https://daedalushealth.ai"
    : "http://localhost:3000";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface OrgActionResult {
  ok: boolean;
  error?: string;
  inviteLink?: string;
  orgSlug?: string;
}

/**
 * Generates a one-time sign-in link for `email` (creating the auth user if
 * necessary, without sending any email itself) and attaches them to the
 * organization as a member. Falls back to a magic-link if the email already
 * belongs to a confirmed user (generateLink's "invite" type only works for
 * brand-new users).
 */
async function generateInviteLink(
  admin: SupabaseClient,
  orgId: string,
  email: string,
  fullName: string,
): Promise<{ ok: true; inviteLink: string } | { ok: false; error: string }> {
  const redirectTo = `${SITE_URL}/auth/invite-callback`;

  let { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      redirectTo,
    },
  });

  if (linkError && /already been registered|already exists|already registered/i.test(linkError.message)) {
    ({ data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    }));
  }

  if (linkError || !linkData?.properties?.action_link || !linkData.user) {
    return {
      ok: false,
      error: linkError?.message ?? "Could not generate an invite link.",
    };
  }

  const { error: membershipError } = await admin
    .from("organization_members")
    .upsert(
      { organization_id: orgId, user_id: linkData.user.id, role: "admin" },
      { onConflict: "organization_id,user_id", ignoreDuplicates: true },
    );

  if (membershipError) {
    return {
      ok: false,
      error: `Invite link was created, but adding the membership failed: ${membershipError.message}`,
    };
  }

  return { ok: true, inviteLink: linkData.properties.action_link };
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

  if (!name || !slug || !contactEmail) {
    return {
      ok: false,
      error: "Organization name, slug, and contact email are required.",
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
    .select("id, slug")
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

  const linkResult = await generateInviteLink(admin, org.id, contactEmail, contactName);

  revalidatePath("/admin/organizations");

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error, orgSlug: org.slug };
  }

  return { ok: true, inviteLink: linkResult.inviteLink, orgSlug: org.slug };
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

  const linkResult = await generateInviteLink(admin, orgId, normalizedEmail, fullName);

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error };
  }

  return { ok: true, inviteLink: linkResult.inviteLink };
}
