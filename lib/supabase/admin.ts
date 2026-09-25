import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * ONLY import this from Server Actions or Route Handlers that are themselves
 * gated behind a super-admin check (see lib/admin-access.ts). Never import
 * this into a Client Component, and never send its output directly to the
 * browser without filtering.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY to be set (Supabase dashboard -> Project
 * Settings -> API -> service_role key). This is a secret: it must not be
 * prefixed with NEXT_PUBLIC_, and should only ever live in server environment
 * variables (.env.local locally, the Vercel project's environment variables
 * in production) - never committed, never exposed to the client bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (and to " +
        "your Vercel project's environment variables) from Supabase " +
        "dashboard -> Project Settings -> API -> service_role key.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
