import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
}

export type OrgAccessResult =
  | { status: "unauthenticated" }
  | { status: "denied" }
  | { status: "ok"; user: User; org: OrgSummary; role: string };

/**
 * Verifies the current session belongs to a member of `orgSlug` and returns
 * the organization + role. Wrapped in React's `cache()` so the layout and
 * any page rendered beneath it can each call this without triggering
 * duplicate Supabase round-trips within the same request.
 */
export const getOrgAccess = cache(
  async (orgSlug: string): Promise<OrgAccessResult> => {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthenticated" };
    }

    const { data: org, error } = await supabase
      .from("organizations")
      .select("id, name, slug, organization_members!inner(role, user_id)")
      .eq("slug", orgSlug)
      .eq("organization_members.user_id", user.id)
      .single();

    if (error || !org) {
      return { status: "denied" };
    }

    const role = org.organization_members[0]?.role ?? "member";

    return {
      status: "ok",
      user,
      org: { id: org.id, name: org.name, slug: org.slug },
      role,
    };
  },
);
