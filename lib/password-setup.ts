import type { User } from "@supabase/supabase-js";

export const MIN_PASSWORD_LENGTH = 8;

export function needsPasswordSetup(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.user_metadata?.must_set_password === true) return true;
  if (user.app_metadata?.is_super_admin === true) return false;

  const setAt = user.user_metadata?.password_set_at;
  return typeof setAt !== "string" || setAt.length === 0;
}

export function passwordSetMetadata(
  existing?: User["user_metadata"] | null,
): Record<string, unknown> {
  return {
    ...(existing ?? {}),
    password_set_at: new Date().toISOString(),
    must_set_password: false,
  };
}

export function validateNewPassword(
  password: string,
  confirm: string,
  email?: string | null,
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirm) {
    return "Those passwords do not match.";
  }
  if (email && password.toLowerCase() === email.toLowerCase()) {
    return "Choose a password that is not your email address.";
  }
  return null;
}
