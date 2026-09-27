"use server";

import { destinationAfterInvite } from "@/lib/invite";
import { passwordSetMetadata, validateNewPassword } from "@/lib/password-setup";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateCustomerPassword(
  formData: FormData,
): Promise<{ ok: false; error: string } | void> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      error: "This reset link is no longer valid. Request a new one.",
    };
  }

  const validationError = validateNewPassword(password, confirm, user.email);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const { error } = await supabase.auth.updateUser({
    password,
    data: passwordSetMetadata(user.user_metadata),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.auth.refreshSession();
  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  redirect(
    await destinationAfterInvite(
      supabase,
      refreshed ?? user,
      null,
      "",
      "/login",
    ),
  );
}
