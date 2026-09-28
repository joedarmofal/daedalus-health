"use server";

import { mailInboxAddress, sendInformationRequestEmail } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";

export interface InformationRequestResult {
  ok: boolean;
  error?: string;
}

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = field(formData, key);
  return value.length > 0 ? value : null;
}

export async function submitInformationRequest(
  formData: FormData,
): Promise<InformationRequestResult> {
  const fullName = field(formData, "fullName");
  const email = field(formData, "email").toLowerCase();
  const organizationName = field(formData, "organizationName");
  const phone = optional(formData, "phone");
  const title = optional(formData, "title");
  const organizationType = optional(formData, "organizationType");
  const organizationSize = optional(formData, "organizationSize");
  const state = optional(formData, "state");
  const interest = optional(formData, "interest");
  const notes = optional(formData, "notes");

  if (!fullName || !email || !organizationName) {
    return {
      ok: false,
      error: "Name, work email, and organization are required.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid work email address." };
  }

  const payload = {
    full_name: fullName,
    email,
    phone,
    title,
    organization_name: organizationName,
    organization_type: organizationType,
    organization_size: organizationSize,
    state,
    interest,
    notes,
  };

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("information_requests").insert(payload);
    if (error && !/information_requests|schema cache|PGRST/i.test(error.message)) {
      return { ok: false, error: error.message };
    }
    if (error) {
      console.error("information_requests insert failed", error.message);
    }
  } catch (err) {
    console.error("information_requests insert failed", err);
  }

  const emailResult = await sendInformationRequestEmail({
    fullName,
    email,
    phone,
    title,
    organizationName,
    organizationType,
    organizationSize,
    state,
    interest,
    notes,
  });

  if (!emailResult.ok) {
    return {
      ok: false,
      error:
        `Your request was received, but we could not notify the Daedalus team by email. Try again or email ${mailInboxAddress()}.`,
    };
  }

  return { ok: true };
}
