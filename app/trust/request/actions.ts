"use server";

import {
  customerMailFromAddress,
  sendTrustRequestEmail,
} from "@/lib/mail";
import type { TrustRequestKind } from "@/lib/trust-request";

export interface TrustRequestResult {
  ok: boolean;
  error?: string;
}

const KINDS = new Set<TrustRequestKind>(["baa", "security-packet", "both"]);

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitTrustRequest(
  formData: FormData,
): Promise<TrustRequestResult> {
  const fullName = field(formData, "fullName");
  const email = field(formData, "email").toLowerCase();
  const organizationName = field(formData, "organizationName");
  const title = field(formData, "title");
  const notes = field(formData, "notes");
  const kindValue = field(formData, "kind");
  const kind = KINDS.has(kindValue as TrustRequestKind)
    ? (kindValue as TrustRequestKind)
    : null;

  if (!fullName || !email || !organizationName || !kind) {
    return {
      ok: false,
      error: "Name, work email, organization, and request type are required.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid work email address." };
  }

  const emailResult = await sendTrustRequestEmail({
    fullName,
    email,
    title: title || null,
    organizationName,
    kind,
    notes: notes || null,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error: `Your request could not be emailed. Try again or write ${customerMailFromAddress()} directly.`,
    };
  }

  return { ok: true };
}
