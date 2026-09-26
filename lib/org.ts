import type { SupabaseClient, User } from "@supabase/supabase-js";

const RESERVED_SLUGS = new Set([
  "admin",
  "login",
  "auth",
  "privacy",
  "about",
  "services",
  "api",
  "legal",
]);

export function isReservedOrgSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

function asSlug(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const slug = value.trim().toLowerCase();
  if (!slug || RESERVED_SLUGS.has(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  return slug;
}

function slugFromUser(user: User): string | null {
  return (
    asSlug(user.app_metadata.org_slug) ??
    asSlug(user.app_metadata.organization_slug) ??
    asSlug(user.user_metadata.org_slug) ??
    asSlug(user.user_metadata.organization_slug)
  );
}

export async function resolveOrgSlug(
  supabase: SupabaseClient,
  user: User | null,
): Promise<string | null> {
  if (!user) {
    return null;
  }

  const fromMetadata = slugFromUser(user);
  if (fromMetadata) {
    return fromMetadata;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_slug")
    .eq("id", user.id)
    .maybeSingle();

  const fromProfile = asSlug(profile?.org_slug);
  if (fromProfile) {
    return fromProfile;
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organizations(slug)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const organization = membership?.organizations as { slug?: unknown } | { slug?: unknown }[] | null;
  const nested = Array.isArray(organization) ? organization[0] : organization;
  return asSlug(nested?.slug);
}
