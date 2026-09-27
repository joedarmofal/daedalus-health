const PRODUCTION_ORIGIN = "https://daedalushealth.ai";

function hostnameIsUnusable(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.endsWith(".vercel.app")
  ) {
    return true;
  }

  return (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

/**
 * True only for a public https URL a customer can open. Localhost, preview
 * hosts, and private networks are never acceptable.
 */
export function isCustomerFacingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.username || parsed.password) return false;
    if (hostnameIsUnusable(parsed.hostname)) return false;
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Public origin for links that customers open.
 *
 * Always the live site. Do not derive this from NODE_ENV, request Host,
 * or NEXT_PUBLIC_SITE_URL — those are localhost when an operator runs
 * `next dev`, and Supabase's Site URL is often localhost too.
 */
export function publicAppUrl(): string {
  return PRODUCTION_ORIGIN;
}

export function safeAppPath(next?: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}

export function publicAuthCallbackUrl(next?: string): string {
  const url = new URL("/auth/callback", PRODUCTION_ORIGIN);
  const path = safeAppPath(next);
  if (path !== "/") {
    url.searchParams.set("next", path);
  }
  return url.toString();
}

/** One-time magic-link / recovery URL we send ourselves — never Supabase's Site URL. */
export function publicAuthVerifyUrl(input: {
  tokenHash: string;
  type: string;
  next?: string;
}): string {
  const url = new URL("/auth/callback", PRODUCTION_ORIGIN);
  url.searchParams.set("token_hash", input.tokenHash);
  url.searchParams.set("type", input.type);
  const path = safeAppPath(input.next);
  if (path !== "/") {
    url.searchParams.set("next", path);
  }
  return url.toString();
}

export function publicInviteUrl(input: {
  tokenHash: string;
  type: string;
  orgSlug: string;
}): string {
  const url = new URL("/auth/invite", PRODUCTION_ORIGIN);
  url.searchParams.set("token_hash", input.tokenHash);
  url.searchParams.set("type", input.type);
  url.searchParams.set("org", input.orgSlug);
  return url.toString();
}
