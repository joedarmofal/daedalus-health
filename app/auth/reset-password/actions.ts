"use server";

import { sendCustomerAuthLink } from "@/lib/customer-auth-mail";

export async function requestPasswordReset(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return sendCustomerAuthLink({
    email: String(formData.get("email") ?? ""),
    kind: "recovery",
    next: "/auth/update-password",
  });
}
