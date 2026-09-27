"use server";

import { getAccreditationAccess } from "@/lib/accreditation-access";
import {
  ensureAccreditationProgram,
} from "@/lib/accreditation-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { PIF_STATUSES, type PifStatus } from "@/lib/camts-pif";
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

  revalidatePath("/accreditation/workspace");
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

  revalidatePath("/accreditation/workspace");
  revalidatePath("/accreditation/workspace/pif");
  revalidatePath("/accreditation/workspace/gaps");
  revalidatePath("/accreditation/workspace/export");
  return { ok: true };
}
