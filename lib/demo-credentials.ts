import type { User } from "@supabase/supabase-js";

export const DEMO_EMAIL_DOMAIN = "demo.daedalushealth.ai";
export const DEMO_ORG_SLUG = "demo";
export const DEMO_ORG_NAME = "Demo Program";

const USERNAME_PATTERN = /^[a-z][a-z0-9_-]{2,31}$/;

export function validateDemoUsername(username: string): string | null {
  const normalized = username.trim().toLowerCase();
  if (normalized.includes("@")) {
    return "Use a username, not an email. They will sign in with this username and the password you set.";
  }
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Username must be 3–32 characters, start with a letter, and use only letters, numbers, hyphens, or underscores.";
  }
  return null;
}

export function demoEmailForUsername(username: string): string {
  return `${username.trim().toLowerCase()}@${DEMO_EMAIL_DOMAIN}`;
}

/** Map a login field to the auth email. Usernames become demo@domain accounts. */
export function normalizeLoginIdentifier(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.includes("@")) return trimmed;
  return demoEmailForUsername(trimmed);
}

export function isUsernameLogin(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.includes("@");
}

export function portalDisplayName(user: User): string {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  if (fullName) return fullName;

  const username =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username.trim()
      : "";
  if (username) return username;

  return user.email ?? "Guest";
}
