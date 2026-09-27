"use server";

import { sendCustomerAuthLink } from "@/lib/customer-auth-mail";
import { safeAppPath } from "@/lib/public-url";

export async function requestMagicLink(input: {
  email: string;
  next?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  return sendCustomerAuthLink({
    email: input.email,
    kind: "magiclink",
    next: safeAppPath(input.next),
  });
}
