"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { ensureAccreditationProgram } from "@/lib/accreditation-data";
import {
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  demoEmailForUsername,
  validateDemoUsername,
} from "@/lib/demo-credentials";
import { MIN_PASSWORD_LENGTH, passwordSetMetadata } from "@/lib/password-setup";
import { publicAppUrl } from "@/lib/public-url";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export interface DemoUserResult {
  ok: boolean;
  error?: string;
  username?: string;
  password?: string;
  displayName?: string;
  orgName?: string;
  orgSlug?: string;
  loginUrl?: string;
  portalUrl?: string;
  emergencyUrl?: string;
  resetExisting?: boolean;
}

async function findUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<{ user: User | null; error?: string }> {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      return { user: null, error: error.message };
    }

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
    if (match) return { user: match };
    if (data.users.length < perPage) return { user: null };
    page += 1;
  }

  return { user: null };
}

async function ensureMembership(
  admin: SupabaseClient,
  orgId: string,
  userId: string,
  fullName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selectError } = await admin
    .from("organization_members")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return { ok: false, error: selectError.message };
  }

  if (existing?.id) {
    if (fullName) {
      await admin
        .from("organization_members")
        .update({ full_name: fullName })
        .eq("id", existing.id);
    }
    return { ok: true };
  }

  const { error } = await admin.from("organization_members").insert({
    organization_id: orgId,
    user_id: userId,
    role: "admin",
    ...(fullName ? { full_name: fullName } : {}),
  });

  if (error && /full_name|schema cache|PGRST204/i.test(error.message)) {
    const retry = await admin.from("organization_members").insert({
      organization_id: orgId,
      user_id: userId,
      role: "admin",
    });
    if (retry.error && retry.error.code !== "23505") {
      return { ok: false, error: retry.error.message };
    }
    return { ok: true };
  }

  if (error && error.code !== "23505") {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

async function resolveDemoOrganization(
  admin: SupabaseClient,
  createdBy: string,
  orgId: string,
): Promise<
  | { ok: true; org: { id: string; slug: string; name: string } }
  | { ok: false; error: string }
> {
  if (orgId) {
    const { data: org, error } = await admin
      .from("organizations")
      .select("id, slug, name")
      .eq("id", orgId)
      .single();
    if (error || !org) {
      return { ok: false, error: error?.message ?? "Organization not found." };
    }
    return { ok: true, org };
  }

  const { data: existing } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", DEMO_ORG_SLUG)
    .maybeSingle();

  if (existing) {
    return { ok: true, org: existing };
  }

  const { data: created, error: createError } = await admin
    .from("organizations")
    .insert({
      name: DEMO_ORG_NAME,
      slug: DEMO_ORG_SLUG,
      primary_contact_email: demoEmailForUsername("demo"),
      created_by: createdBy,
    })
    .select("id, slug, name")
    .single();

  if (createError || !created) {
    return {
      ok: false,
      error:
        createError?.code === "23505"
          ? "The demo organization slug is already in use."
          : (createError?.message ?? "Could not create the demo organization."),
    };
  }

  await admin.from("organization_intake").upsert(
    {
      organization_id: created.id,
      health_system_type: "Demo",
      notes: "Created for site demonstrations.",
      submitted_by: createdBy,
    },
    { onConflict: "organization_id" },
  );

  try {
    await ensureAccreditationProgram(created.id, created.name);
  } catch {
    // EMS tables may not exist yet; portal demo still works.
  }

  return { ok: true, org: created };
}

export async function createDemoUser(
  formData: FormData,
): Promise<DemoUserResult> {
  const access = await getAdminAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const displayName =
    String(formData.get("displayName") ?? "").trim() || "Demo guest";
  const orgId = String(formData.get("organizationId") ?? "").trim();
  const resetExisting = formData.get("resetExisting") === "on";

  const usernameError = validateDemoUsername(username);
  if (usernameError) {
    return { ok: false, error: usernameError };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${MIN_PASSWORD_LENGTH} characters for the password.`,
    };
  }
  if (password !== confirm) {
    return { ok: false, error: "Those passwords do not match." };
  }
  if (password.toLowerCase() === username) {
    return { ok: false, error: "Choose a password that is not the username." };
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

  const orgResult = await resolveDemoOrganization(admin, access.user.id, orgId);
  if (!orgResult.ok) {
    return orgResult;
  }

  const email = demoEmailForUsername(username);
  const metadata = passwordSetMetadata({
    full_name: displayName,
    username,
    is_demo: true,
    org_slug: orgResult.org.slug,
  });

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  let user = created.data.user;
  let didReset = false;

  if (created.error || !user) {
    const alreadyExists = /already been registered|already exists|already registered/i.test(
      created.error?.message ?? "",
    );
    if (!alreadyExists) {
      return {
        ok: false,
        error: created.error?.message ?? "Could not create the demo user.",
      };
    }

    const existing = await findUserByEmail(admin, email);
    if (existing.error) {
      return { ok: false, error: existing.error };
    }
    if (!existing.user) {
      return {
        ok: false,
        error: "That username is already taken, but the account could not be loaded.",
      };
    }
    if (existing.user.user_metadata?.is_demo !== true) {
      return {
        ok: false,
        error:
          "That username already belongs to a non-demo account. Choose a different username.",
      };
    }
    if (!resetExisting) {
      return {
        ok: false,
        error:
          "That demo username already exists. Check “reset password if the username exists” to re-issue credentials.",
      };
    }

    const updated = await admin.auth.admin.updateUserById(existing.user.id, {
      password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (updated.error || !updated.data.user) {
      return {
        ok: false,
        error: updated.error?.message ?? "Could not update the existing demo user.",
      };
    }
    user = updated.data.user;
    didReset = true;
  }

  const membership = await ensureMembership(
    admin,
    orgResult.org.id,
    user.id,
    displayName,
  );
  if (!membership.ok) {
    return membership;
  }

  revalidatePath("/admin/demo-users");
  revalidatePath("/admin/organizations");

  const origin = publicAppUrl();
  return {
    ok: true,
    username,
    password,
    displayName,
    orgName: orgResult.org.name,
    orgSlug: orgResult.org.slug,
    loginUrl: `${origin}/login`,
    portalUrl: `${origin}/${orgResult.org.slug}`,
    emergencyUrl: `${origin}/emergency-services`,
    resetExisting: didReset,
  };
}
