"use server";

import { destinationAfterInvite } from "@/lib/invite";
import { parseOrgSlug } from "@/lib/org";
import {
  needsPasswordSetup,
  validateNewPassword,
} from "@/lib/password-setup";
import { publicAppUrl } from "@/lib/public-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function setCustomerPassword(
  formData: FormData,
): Promise<{ ok: false; error: string } | void> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const org = parseOrgSlug(formData.get("org"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validationError = validateNewPassword(password, confirm, user.email);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const { error } = await supabase.auth.updateUser({
    password,
    data: {
      ...(user.user_metadata ?? {}),
      password_set_at: new Date().toISOString(),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  await supabase.auth.refreshSession();
  const {
    data: { user: refreshed },
  } = await supabase.auth.getUser();

  const confirmed = refreshed
    ? {
        ...refreshed,
        user_metadata: {
          ...(refreshed.user_metadata ?? {}),
          password_set_at:
            typeof refreshed.user_metadata?.password_set_at === "string"
              ? refreshed.user_metadata.password_set_at
              : new Date().toISOString(),
        },
      }
    : {
        ...user,
        user_metadata: {
          ...(user.user_metadata ?? {}),
          password_set_at: new Date().toISOString(),
        },
      };

  if (needsPasswordSetup(confirmed)) {
    return {
      ok: false,
      error: "Your password was saved, but we could not confirm it. Try again.",
    };
  }

  redirect(
    await destinationAfterInvite(supabase, confirmed, org, publicAppUrl()),
  );
}
