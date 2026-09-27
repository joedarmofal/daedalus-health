"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { isReservedOrgSlug } from "@/lib/org";
import { isCustomerFacingUrl, publicAppUrl, publicInviteUrl } from "@/lib/public-url";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function ensureOrgMembership(
  admin: SupabaseClient,
  orgId: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selectError } = await admin
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return { ok: true };
  }

  if (selectError) {
    return {
      ok: false,
      error: `Could not check organization membership: ${selectError.message}`,
    };
  }

  const { error: insertError } = await admin.from("organization_members").insert({
    organization_id: orgId,
    user_id: userId,
    role: "admin",
  });

  // 23505 = already a member (race or unique constraint). Treat as success.
  if (insertError && insertError.code !== "23505") {
    return {
      ok: false,
      error: `Invite link was created, but adding the membership failed: ${insertError.message}`,
    };
  }

  return { ok: true };
}

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
  org: { id: string; slug: string },
  email: string,
  fullName: string,
): Promise<{ ok: true; inviteLink: string } | { ok: false; error: string }> {
  const redirectTo = `${publicAppUrl()}/auth/invite`;
  const userData = {
    ...(fullName ? { full_name: fullName } : {}),
    org_slug: org.slug,
  };

  let linkType: "invite" | "magiclink" = "invite";
  let { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      data: userData,
      redirectTo,
    },
  });

  if (linkError && /already been registered|already exists|already registered/i.test(linkError.message)) {
    linkType = "magiclink";
    ({ data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    }));
  }

  const hashedToken = linkData?.properties?.hashed_token;
  if (linkError || !hashedToken || !linkData?.user) {
    return {
      ok: false,
      error: linkError?.message ?? "Could not generate an invite link.",
    };
  }

  const membership = await ensureOrgMembership(admin, org.id, linkData.user.id);
  if (!membership.ok) {
    return membership;
  }

  // Convenience for resolveOrgSlug; membership is the source of truth.
  await admin.auth.admin.updateUserById(linkData.user.id, {
    user_metadata: {
      ...((linkData.user.user_metadata as Record<string, unknown> | undefined) ?? {}),
      ...userData,
    },
  });

  // Never hand customers Supabase's action_link — it embeds whatever Site URL
  // is configured in the project (often http://localhost:3000).
  const inviteLink = publicInviteUrl({
    tokenHash: hashedToken,
    type: linkType,
    orgSlug: org.slug,
  });

  if (!isCustomerFacingUrl(inviteLink)) {
    return {
      ok: false,
      error: "Refused to issue a non-public invite link. The customer would not be able to open it.",
    };
  }

  return { ok: true, inviteLink };
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

  const linkResult = await generateInviteLink(
    admin,
    { id: org.id, slug: org.slug },
    contactEmail,
    contactName,
  );

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

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id, slug")
    .eq("id", orgId)
    .single();

  if (orgError || !org) {
    return { ok: false, error: orgError?.message ?? "Organization not found." };
  }

  const linkResult = await generateInviteLink(admin, org, normalizedEmail, fullName);

  if (!linkResult.ok) {
    return { ok: false, error: linkResult.error };
  }

  return { ok: true, inviteLink: linkResult.inviteLink };
}
