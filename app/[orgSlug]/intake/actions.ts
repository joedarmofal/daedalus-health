"use server";

import { getOrgAccess } from "@/lib/org-access";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SubmitIntakeResult {
  ok: boolean;
  error?: string;
}

export async function submitIntake(
  orgSlug: string,
  formData: FormData,
): Promise<SubmitIntakeResult> {
  const access = await getOrgAccess(orgSlug);

  if (access.status !== "ok") {
    return { ok: false, error: "Not authorized." };
  }

  const supabase = await createClient();

  const primaryUseCases = formData.getAll("primaryUseCases").map(String);

  const field = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length > 0 ? value : null;
  };

  const payload = {
    organization_id: access.org.id,
    health_system_type: field("healthSystemType"),
    org_size: field("orgSize"),
    ehr_vendor: field("ehrVendor"),
    primary_use_cases: primaryUseCases,
    governance_maturity: field("governanceMaturity"),
    primary_contact_name: field("contactName"),
    primary_contact_title: field("contactTitle"),
    primary_contact_email: field("contactEmail"),
    primary_contact_phone: field("contactPhone"),
    additional_stakeholders: field("additionalStakeholders"),
    notes: field("notes"),
    submitted_by: access.user.id,
  };

  const { error } = await supabase
    .from("organization_intake")
    .upsert(payload, { onConflict: "organization_id" });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/${orgSlug}`);
  revalidatePath(`/${orgSlug}/intake`);

  return { ok: true };
}
