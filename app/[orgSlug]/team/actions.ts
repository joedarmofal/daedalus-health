"use server";

import { inviteUserToOrganization } from "@/lib/invite-member";
import { getOrgAccess } from "@/lib/org-access";
import { isOrgAdminRole } from "@/lib/org-membership";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface InviteTeammateResult {
  ok: boolean;
  error?: string;
  emailSent?: boolean;
  emailedTo?: string;
}

export async function inviteTeammate(
  orgSlug: string,
  formData: FormData,
): Promise<InviteTeammateResult> {
  const access = await getOrgAccess(orgSlug);
  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }
  if (!isOrgAdminRole(access.role)) {
    return {
      ok: false,
      error: "Only an organization administrator can add teammates.",
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!fullName || !email) {
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

  const result = await inviteUserToOrganization(
    admin,
    access.org,
    email,
    fullName,
    "member",
    "teammate",
  );

  revalidatePath(`/${orgSlug}`);
  revalidatePath(`/${orgSlug}/team`);
  revalidatePath("/admin/organizations");

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    emailSent: result.emailSent,
    emailedTo: result.emailedTo ?? email,
    error: result.emailSent
      ? undefined
      : result.error ?? "The teammate was added, but the invite email could not be sent.",
  };
}
