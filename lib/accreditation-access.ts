import { resolveOrgSlug } from "@/lib/org";
import { needsPasswordSetup } from "@/lib/password-setup";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

export interface AccreditationOrg {
  id: string;
  name: string;
  slug: string;
}

export type AccreditationAccess =
  | { status: "unauthenticated" }
  | { status: "need_password"; user: User }
  | { status: "no_organization"; user: User }
  | {
      status: "ok";
      user: User;
      org: AccreditationOrg;
      role: string;
    };

export const getAccreditationAccess = cache(
  async (): Promise<AccreditationAccess> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthenticated" };
    }

    if (needsPasswordSetup(user)) {
      return { status: "need_password", user };
    }

    const orgSlug = await resolveOrgSlug(supabase, user);
    if (!orgSlug) {
      return { status: "no_organization", user };
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .eq("slug", orgSlug)
      .maybeSingle();

    if (!org) {
      return { status: "no_organization", user };
    }

    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", org.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return { status: "no_organization", user };
    }

    return {
      status: "ok",
      user,
      org: { id: org.id, name: org.name, slug: org.slug },
      role: membership.role ?? "member",
    };
  },
);
