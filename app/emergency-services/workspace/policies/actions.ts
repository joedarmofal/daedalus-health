"use server";

import { getAccreditationAccess } from "@/lib/accreditation-access";
import { ensureAccreditationProgram } from "@/lib/accreditation-data";
import {
  POLICY_CATEGORIES,
  POLICY_STATUSES,
  type PolicyCategory,
  type PolicyStatus,
} from "@/lib/emergency-policies";
import { draftPolicyFromMaterials } from "@/lib/policy-ai";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  extractPifMaterials,
  isPifAiConfigured,
} from "@/lib/pif-ai";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = field(formData, key);
  return value.length > 0 ? value : null;
}

function missingTableMessage() {
  return "The policy library tables are not in Supabase yet. Run supabase-migrations/008_emergency_policies.sql in the SQL Editor.";
}

export async function draftEmergencyPolicy(
  formData: FormData,
): Promise<
  | { ok: true; title: string; purpose: string; body: string }
  | { ok: false; error: string }
> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to draft a policy." };
  }

  if (!isPifAiConfigured()) {
    return {
      ok: false,
      error:
        "Policy drafting is not configured on this server. Add OPENAI_API_KEY in Vercel Production environment variables, then redeploy.",
    };
  }

  const files = formData
    .getAll("materials")
    .filter((value): value is File => value instanceof File && value.size > 0);
  const extracted = await extractPifMaterials(files);
  if (!extracted.ok) return extracted;

  const notes = optional(formData, "ai_notes") ?? "";
  const title = field(formData, "title");
  const existingBody = optional(formData, "existing_body") ?? "";
  const category = field(formData, "category") || "clinical";

  if (!notes && !title && !existingBody && extracted.materials.length === 0) {
    return {
      ok: false,
      error: "Add a title, a short prompt, or upload a source policy before drafting.",
    };
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);

  try {
    const draft = await draftPolicyFromMaterials({
      organizationName: access.org.name,
      programName: program?.program_name,
      transportModes: program?.transport_modes,
      category,
      title,
      notes,
      existingBody,
      materials: extracted.materials,
    });
    return { ok: true, ...draft };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "The draft could not be written.",
    };
  }
}

export async function saveEmergencyPolicy(
  formData: FormData,
): Promise<{ ok: false; error: string } | void> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to save a policy." };
  }

  const title = field(formData, "title");
  if (!title) {
    return { ok: false, error: "A policy title is required." };
  }

  const category = field(formData, "category") as PolicyCategory;
  const status = field(formData, "status") as PolicyStatus;
  if (!POLICY_CATEGORIES.some((item) => item.id === category)) {
    return { ok: false, error: "Choose a valid category." };
  }
  if (!POLICY_STATUSES.some((item) => item.id === status)) {
    return { ok: false, error: "Choose a valid status." };
  }

  const payload = {
    organization_id: access.org.id,
    title,
    category,
    status,
    purpose: optional(formData, "purpose"),
    body: optional(formData, "body"),
    owner_name: optional(formData, "owner_name"),
    review_date: optional(formData, "review_date"),
    source_notes: optional(formData, "source_notes"),
    updated_by: access.user.id,
  };

  const admin = createAdminClient();
  const existingId = optional(formData, "policy_id");

  if (existingId) {
    const { error } = await admin
      .from("emergency_policies")
      .update(payload)
      .eq("id", existingId)
      .eq("organization_id", access.org.id);
    if (error) {
      return {
        ok: false,
        error: /emergency_policies|schema cache|PGRST205/i.test(error.message)
          ? missingTableMessage()
          : error.message,
      };
    }
    revalidatePath("/emergency-services/workspace/policies");
    revalidatePath(`/emergency-services/workspace/policies/${existingId}`);
    return;
  }

  const { data, error } = await admin
    .from("emergency_policies")
    .insert({ ...payload, created_by: access.user.id })
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      ok: false,
      error: error && /emergency_policies|schema cache|PGRST205/i.test(error.message)
        ? missingTableMessage()
        : error?.message ?? "The policy could not be saved.",
    };
  }

  revalidatePath("/emergency-services/workspace/policies");
  redirect(`/emergency-services/workspace/policies/${data.id}`);
}

export async function deleteEmergencyPolicy(
  formData: FormData,
): Promise<{ ok: false; error: string } | void> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to delete a policy." };
  }

  const policyId = field(formData, "policy_id");
  if (!policyId) {
    return { ok: false, error: "Missing policy." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("emergency_policies")
    .delete()
    .eq("id", policyId)
    .eq("organization_id", access.org.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/emergency-services/workspace/policies");
  redirect("/emergency-services/workspace/policies");
}
