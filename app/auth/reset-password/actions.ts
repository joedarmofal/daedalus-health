"use server";

import { publicAuthCallbackUrl } from "@/lib/public-url";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter the work email you use for the portal." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: publicAuthCallbackUrl("/auth/update-password"),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
