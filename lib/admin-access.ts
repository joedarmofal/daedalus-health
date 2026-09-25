import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cache } from "react";

export type AdminAccessResult =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "ok"; user: User };

/**
 * Verifies the current session belongs to a super admin
 * (app_metadata.is_super_admin === true). Wrapped in React's cache() so the
 * admin layout and any page beneath it share a single Supabase round-trip
 * per request.
 *
 * app_metadata (not user_metadata) is used deliberately: it can only be set
 * via the Supabase service-role / admin API, so it can't be spoofed by the
 * user editing their own profile.
 */
export const getAdminAccess = cache(async (): Promise<AdminAccessResult> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "unauthenticated" };
  }

  const isSuperAdmin = user.app_metadata?.is_super_admin === true;

  if (!isSuperAdmin) {
    return { status: "forbidden" };
  }

  return { status: "ok", user };
});
