"use server";

import { getAdminAccess } from "@/lib/admin-access";
import { ensureAccreditationProgram } from "@/lib/accreditation-data";
import {
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  TEST_DEMO_ORGANIZATIONS,
  demoEmailForUsername,
  validateDemoUsername,
} from "@/lib/demo-credentials";
import { parseOrgSlug } from "@/lib/org";
import { ensureOrgMembership } from "@/lib/org-membership";
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
  attachedExisting?: boolean;
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

async function ensureDemoMembership(
  admin: SupabaseClient,
  orgId: string,
  userId: string,
  fullName: string,
) {
  return ensureOrgMembership(admin, orgId, userId, fullName, "admin");
}

function canonicalDemoOrgSlug(value: string): string | null {
  const normalized = value.trim().toLowerCase().replace(/['’]/g, "");
  if (
    normalized === "childrens" ||
    normalized === "childrens-hospital" ||
    normalized === "childrens-hospital-colorado" ||
    normalized === "chco"
  ) {
    return "childrens-hospital-colorado";
  }
  return parseOrgSlug(normalized);
}

async function provisionDemoOrganization(
  admin: SupabaseClient,
  createdBy: string,
  name: string,
  slug: string,
): Promise<{ id: string; slug: string; name: string } | null> {
  const { data: existing } = await admin
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await admin
    .from("organizations")
    .insert({
      name,
      slug,
      primary_contact_email: demoEmailForUsername("demo"),
      created_by: createdBy,
    })
    .select("id, slug, name")
    .single();

  if (error || !created) {
    if (error?.code === "23505") {
      const { data: raced } = await admin
        .from("organizations")
        .select("id, slug, name")
        .eq("slug", slug)
        .maybeSingle();
      return raced ?? null;
    }
    return null;
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

  return created;
}

export async function ensureTestDemoOrganizations(
  admin: SupabaseClient,
  createdBy: string,
) {
  for (const org of TEST_DEMO_ORGANIZATIONS) {
    await provisionDemoOrganization(admin, createdBy, org.name, org.slug);
  }
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

  const created = await provisionDemoOrganization(
    admin,
    createdBy,
    DEMO_ORG_NAME,
    DEMO_ORG_SLUG,
  );
  if (!created) {
    return { ok: false, error: "Could not create the demo organization." };
  }
  return { ok: true, org: created };
}

export async function repairDemoMembershipsFromMetadata(
  admin?: SupabaseClient,
): Promise<number> {
  let client = admin;
  if (!client) {
    try {
      client = createAdminClient();
    } catch {
      return 0;
    }
  }

  const { data: orgs } = await client.from("organizations").select("id, slug");
  const orgBySlug = new Map((orgs ?? []).map((org) => [org.slug, org.id]));
  let attached = 0;
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) break;

    for (const user of data.users) {
      if (user.user_metadata?.is_demo !== true) continue;
      const rawSlug =
        typeof user.user_metadata?.org_slug === "string"
          ? user.user_metadata.org_slug
          : "";
      const slug = canonicalDemoOrgSlug(rawSlug);
      const orgId = slug ? orgBySlug.get(slug) : undefined;
      if (!orgId) continue;
      const fullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "";
      const result = await ensureDemoMembership(client, orgId, user.id, fullName);
      if (!result.ok) continue;
      attached += 1;
      if (rawSlug !== slug) {
        await client.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            org_slug: slug,
          },
        });
      }
    }

    if (data.users.length < perPage) break;
    page += 1;
  }

  return attached;
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

  await ensureTestDemoOrganizations(admin, access.user.id);
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
  let attachedExisting = false;

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

    attachedExisting = true;

    if (resetExisting) {
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
    } else {
      const updated = await admin.auth.admin.updateUserById(existing.user.id, {
        user_metadata: {
          ...existing.user.user_metadata,
          full_name: displayName,
          username,
          is_demo: true,
          org_slug: orgResult.org.slug,
        },
      });
      user = updated.data.user ?? existing.user;
    }
  }

  const membership = await ensureDemoMembership(
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
  revalidatePath(`/${orgResult.org.slug}`);
  revalidatePath(`/${orgResult.org.slug}/team`);

  const origin = publicAppUrl();
  return {
    ok: true,
    username,
    password: didReset || !attachedExisting ? password : undefined,
    displayName,
    orgName: orgResult.org.name,
    orgSlug: orgResult.org.slug,
    loginUrl: `${origin}/login`,
    portalUrl: `${origin}/${orgResult.org.slug}`,
    emergencyUrl: `${origin}/emergency-services`,
    resetExisting: didReset,
    attachedExisting,
  };
}
