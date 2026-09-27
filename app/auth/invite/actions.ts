"use server";

import { destinationAfterInvite, parseInviteType } from "@/lib/invite";
import { parseOrgSlug } from "@/lib/org";
import { needsPasswordSetup } from "@/lib/password-setup";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function acceptInvite(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "").trim();
  const type = parseInviteType(formData.get("type")) ?? "invite";
  const org = parseOrgSlug(formData.get("org"));

  if (!tokenHash) {
    redirect("/auth/invite-callback?error=missing");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    redirect("/auth/invite-callback?error=expired");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (type === "invite" || type === "signup" || needsPasswordSetup(user)) {
    redirect(org ? `/${org}/intake` : "/auth/set-password");
  }

  redirect(await destinationAfterInvite(supabase, user, org, ""));
}
