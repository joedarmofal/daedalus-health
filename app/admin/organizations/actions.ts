"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { tokenFromGenerateLink } from "@/lib/invite";
import { sendWelcomeEmail } from "@/lib/mail";
import { isReservedOrgSlug } from "@/lib/org";
import { isCustomerFacingUrl, publicAppUrl, publicInviteUrl } from "@/lib/public-url";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function writeMembership(
  admin: SupabaseClient,
  row: {
    organization_id: string;
    user_id: string;
    role: string;
    full_name?: string | null;
  },
  existingId?: string,
) {
  if (existingId) {
    const { error } = await admin
      .from("organization_members")
      .update(row.full_name ? { full_name: row.full_name } : {})
      .eq("id", existingId);
    return error;
  }

  const { error } = await admin.from("organization_members").insert(row);
  if (
    error &&
    row.full_name &&
    /full_name|schema cache|PGRST204/i.test(error.message)
  ) {
    const withoutName = {
      organization_id: row.organization_id,
      user_id: row.user_id,
      role: row.role,
    };
    const retry = await admin.from("organization_members").insert(withoutName);
    return retry.error;
  }
  return error;
}

async function ensureOrgMembership(
  admin: SupabaseClient,
  orgId: string,
  userId: string,
  fullName?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selectError } = await admin
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return {
      ok: false,
      error: `Could not check organization membership: ${selectError.message}`,
    };
  }

  const writeError = await writeMembership(
    admin,
    {
      organization_id: orgId,
      user_id: userId,
      role: "admin",
      ...(fullName ? { full_name: fullName } : {}),
    },
    existing?.id,
  );

  // 23505 = already a member (race or unique constraint). Treat as success.
  if (writeError && writeError.code !== "23505") {
    return {
      ok: false,
      error: `Invite link was created, but adding the membership failed: ${writeError.message}`,
    };
  }

  return { ok: true };
}

export interface OrgActionResult {
  ok: boolean;
  error?: string;
  inviteLink?: string;
  orgSlug?: string;
  emailSent?: boolean;
  emailedTo?: string;
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
  org: { id: string; slug: string; name: string },
  email: string,
  fullName: string,
): Promise<
  | { ok: true; inviteLink: string; emailSent: boolean; emailError?: string }
  | { ok: false; error: string }
> {
  const redirectTo = `${publicAppUrl()}/auth/invite`;
  const userData = {
    ...(fullName ? { full_name: fullName } : {}),
    org_slug: org.slug,
    must_set_password: true,
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

  const token = tokenFromGenerateLink(linkData?.properties);
  if (linkError || !token || !linkData?.user) {
    return {
      ok: false,
      error: linkError?.message ?? "Could not generate an invite link.",
    };
  }

  const membership = await ensureOrgMembership(
    admin,
    org.id,
    linkData.user.id,
    fullName,
  );
  if (!membership.ok) {
    return membership;
  }

  // Do not call updateUserById here — mutating the user voids the one-time
  // token that generateLink just created. New-user metadata is already set
  // via generateLink's `data` option; membership + ?org= is enough otherwise.

  // Never hand customers Supabase's action_link — it embeds whatever Site URL
  // is configured in the project (often http://localhost:3000).
  const inviteLink = publicInviteUrl({
    tokenHash: token.tokenHash,
    type: token.type || linkType,
    orgSlug: org.slug,
  });

  if (!isCustomerFacingUrl(inviteLink)) {
    return {
      ok: false,
      error: "Refused to issue a non-public invite link. The customer would not be able to open it.",
    };
  }

  const emailResult = await sendWelcomeEmail({
    to: email,
    contactName: fullName,
    orgName: org.name,
    orgSlug: org.slug,
    inviteLink,
  });

  return {
    ok: true,
    inviteLink,
    emailSent: emailResult.ok,
    emailError: emailResult.ok ? undefined : emailResult.error,
  };
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

  const linkResult = await generateInviteLink(
    admin,
    { id: org.id, slug: org.slug, name: org.name ?? name },
    contactEmail,
    contactName,
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
      : linkResult.emailError ?? "The welcome email could not be sent.",
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

  const linkResult = await generateInviteLink(
    admin,
    org,
    normalizedEmail,
    resolvedName,
  );

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
      : linkResult.emailError ?? "The welcome email could not be sent.",
  };
}
