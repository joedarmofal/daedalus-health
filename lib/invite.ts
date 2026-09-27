import { parseOrgSlug, resolveOrgSlug } from "@/lib/org";
import { needsPasswordSetup } from "@/lib/password-setup";
import type { EmailOtpType, SupabaseClient, User } from "@supabase/supabase-js";

const VERIFY_TYPES = new Set<string>([
  "invite",
  "magiclink",
  "signup",
  "email",
  "recovery",
]);

export function parseInviteType(value: unknown): EmailOtpType | null {
  if (typeof value !== "string" || !VERIFY_TYPES.has(value)) {
    return null;
  }
  return value as EmailOtpType;
}

/**
 * The token GoTrue actually stored — taken from action_link, not
 * properties.hashed_token, which can diverge from the verify URL.
 */
export function tokenFromGenerateLink(properties: {
  action_link?: string | null;
  hashed_token?: string | null;
  verification_type?: string | null;
} | null | undefined): { tokenHash: string; type: string } | null {
  if (properties?.action_link) {
    try {
      const url = new URL(properties.action_link);
      const token = url.searchParams.get("token");
      const type = url.searchParams.get("type");
      if (token) {
        return {
          tokenHash: token,
          type: type || properties.verification_type || "invite",
        };
      }
    } catch {
      // fall through to hashed_token
    }
  }

  if (properties?.hashed_token) {
    return {
      tokenHash: properties.hashed_token,
      type: properties.verification_type || "invite",
    };
  }

  return null;
}

export async function destinationAfterInvite(
  supabase: SupabaseClient,
  user: User | null,
  preferredOrg: string | null,
  origin: string,
  errorPath = "/auth/invite-callback?error=no_organization",
): Promise<string> {
  const candidates: string[] = [];
  const preferred = parseOrgSlug(preferredOrg);
  if (preferred) candidates.push(preferred);

  const resolved = await resolveOrgSlug(supabase, user);
  if (resolved && !candidates.includes(resolved)) {
    candidates.push(resolved);
  }

  if (needsPasswordSetup(user)) {
    const slug = candidates[0];
    return slug
      ? `${origin}/auth/set-password?org=${encodeURIComponent(slug)}`
      : `${origin}/auth/set-password`;
  }

  for (const slug of candidates) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, organization_members!inner(user_id)")
      .eq("slug", slug)
      .eq("organization_members.user_id", user?.id ?? "")
      .maybeSingle();

    if (!org?.slug) continue;

    const { data: intake } = await supabase
      .from("organization_intake")
      .select("organization_id")
      .eq("organization_id", org.id)
      .maybeSingle();

    return intake ? `${origin}/${org.slug}` : `${origin}/${org.slug}/intake`;
  }

  return `${origin}${errorPath}`;
}
