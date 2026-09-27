"use server";

import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
} from "@/lib/accreditation-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCamtsItem, PIF_STATUSES, type PifStatus } from "@/lib/camts-pif";
import {
  draftPifFromMaterials,
  extractPifMaterials,
  isPifAiConfigured,
} from "@/lib/pif-ai";
import { revalidatePath } from "next/cache";

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optional(formData: FormData, key: string): string | null {
  const value = field(formData, key);
  return value.length > 0 ? value : null;
}

export async function saveAccreditationProgram(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to save program details." };
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  if (!program) {
    return {
      ok: false,
      error:
        "The accreditation tables are not in Supabase yet. Run supabase-migrations/007_accreditation.sql in the SQL Editor.",
    };
  }

  const modes = formData.getAll("transport_modes").map(String);
  const admin = createAdminClient();
  const { error } = await admin
    .from("accreditation_programs")
    .update({
      program_name: field(formData, "program_name") || program.program_name,
      transport_modes: modes,
      accreditation_status: optional(formData, "accreditation_status"),
      camts_edition: field(formData, "camts_edition") || "12th Edition",
      target_survey_date: optional(formData, "target_survey_date"),
      medical_director: optional(formData, "medical_director"),
      program_director: optional(formData, "program_director"),
      base_location: optional(formData, "base_location"),
      notes: optional(formData, "notes"),
    })
    .eq("id", program.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/emergency-services/workspace");
  return { ok: true };
}

export async function savePifItem(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to save PIF work." };
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  if (!program) {
    return {
      ok: false,
      error:
        "The accreditation tables are not in Supabase yet. Run supabase-migrations/007_accreditation.sql in the SQL Editor.",
    };
  }

  const standardId = field(formData, "standard_id");
  const status = field(formData, "status") as PifStatus;
  if (!standardId) {
    return { ok: false, error: "Missing standard." };
  }
  if (!PIF_STATUSES.some((item) => item.id === status)) {
    return { ok: false, error: "Choose a valid status." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("accreditation_pif_items").upsert(
    {
      program_id: program.id,
      standard_id: standardId,
      status,
      narrative: optional(formData, "narrative"),
      evidence_notes: optional(formData, "evidence_notes"),
      owner_name: optional(formData, "owner_name"),
      updated_by: access.user.id,
    },
    { onConflict: "program_id,standard_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/emergency-services/workspace");
  revalidatePath("/emergency-services/workspace/pif");
  revalidatePath("/emergency-services/workspace/gaps");
  revalidatePath("/emergency-services/workspace/export");
  return { ok: true };
}

export async function draftPifItem(
  formData: FormData,
): Promise<
  | { ok: true; narrative: string; evidenceNotes: string }
  | { ok: false; error: string }
> {
  const access = await getAccreditationAccess();
  if (access.status !== "ok") {
    return { ok: false, error: "Sign in to draft PIF language." };
  }

  if (!isPifAiConfigured()) {
    return {
      ok: false,
      error:
        "PIF drafting is not configured on this server. Add OPENAI_API_KEY in Vercel Production environment variables, then redeploy.",
    };
  }

  const standardId = field(formData, "standard_id");
  const found = getCamtsItem(standardId);
  if (!found) {
    return { ok: false, error: "That PIF item was not found." };
  }

  const program = await ensureAccreditationProgram(access.org.id, access.org.name);
  if (!program) {
    return {
      ok: false,
      error:
        "The accreditation tables are not in Supabase yet. Run supabase-migrations/007_accreditation.sql in the SQL Editor.",
    };
  }

  const files = formData
    .getAll("materials")
    .filter((value): value is File => value instanceof File && value.size > 0);

  const extracted = await extractPifMaterials(files);
  if (!extracted.ok) {
    return extracted;
  }

  const notes = optional(formData, "ai_notes") ?? "";
  const existingNarrative = optional(formData, "existing_narrative") ?? "";

  if (!notes && !existingNarrative && extracted.materials.length === 0) {
    return {
      ok: false,
      error:
        "Add a short prompt, keep some existing narrative, or upload a policy / SOP before drafting.",
    };
  }

  try {
    const draft = await draftPifFromMaterials({
      program,
      section: found.section,
      item: found.item,
      notes,
      existingNarrative,
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
