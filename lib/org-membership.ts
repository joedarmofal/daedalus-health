import type { SupabaseClient } from "@supabase/supabase-js";

export type OrgMemberRole = "admin" | "member";

export interface OrgMember {
  id: string;
  userId: string;
  fullName: string | null;
  role: string;
}

export function isOrgAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export async function ensureOrgMembership(
  admin: SupabaseClient,
  orgId: string,
  userId: string,
  fullName?: string,
  role: OrgMemberRole = "member",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: existing, error: selectError } = await admin
    .from("organization_members")
    .select("id, role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    return {
      ok: false,
      error: `Could not check organization membership: ${selectError.message}`,
    };
  }

  if (existing?.id) {
    const patch: { full_name?: string; role?: string } = {};
    if (fullName) patch.full_name = fullName;
    if (role === "admin" && existing.role !== "admin") patch.role = "admin";
    if (Object.keys(patch).length > 0) {
      const { error } = await admin
        .from("organization_members")
        .update(patch)
        .eq("id", existing.id);
      if (error && !/full_name|schema cache|PGRST204/i.test(error.message)) {
        return { ok: false, error: error.message };
      }
    }
    return { ok: true };
  }

  const row = {
    organization_id: orgId,
    user_id: userId,
    role,
    ...(fullName ? { full_name: fullName } : {}),
  };

  const { error } = await admin.from("organization_members").insert(row);
  if (error && fullName && /full_name|schema cache|PGRST204/i.test(error.message)) {
    const retry = await admin.from("organization_members").insert({
      organization_id: orgId,
      user_id: userId,
      role,
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

export async function listOrgMembers(
  client: SupabaseClient,
  orgId: string,
): Promise<OrgMember[]> {
  const withNames = await client
    .from("organization_members")
    .select("id, user_id, full_name, role")
    .eq("organization_id", orgId)
    .order("role", { ascending: true });

  const rows =
    withNames.error && /full_name|schema cache|PGRST204/i.test(withNames.error.message)
      ? (
          await client
            .from("organization_members")
            .select("id, user_id, role")
            .eq("organization_id", orgId)
            .order("role", { ascending: true })
        ).data
      : withNames.data;

  return (rows ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    fullName:
      "full_name" in row && typeof row.full_name === "string" ? row.full_name : null,
    role: typeof row.role === "string" ? row.role : "member",
  }));
}
