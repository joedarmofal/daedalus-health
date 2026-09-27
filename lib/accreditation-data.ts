import { createAdminClient } from "@/lib/supabase/admin";
import type { PifStatus } from "@/lib/camts-pif";

export interface AccreditationProgram {
  id: string;
  organization_id: string;
  program_name: string;
  transport_modes: string[];
  accreditation_status: string | null;
  camts_edition: string;
  target_survey_date: string | null;
  medical_director: string | null;
  program_director: string | null;
  base_location: string | null;
  notes: string | null;
}

export interface AccreditationPifItem {
  standard_id: string;
  status: PifStatus;
  narrative: string | null;
  evidence_notes: string | null;
  owner_name: string | null;
  updated_at: string | null;
}

function isMissingTable(message: string): boolean {
  return /accreditation_programs|accreditation_pif_items|schema cache|PGRST205/i.test(
    message,
  );
}

export async function ensureAccreditationProgram(
  organizationId: string,
  organizationName: string,
): Promise<AccreditationProgram | null> {
  const admin = createAdminClient();
  const { data: existing, error: selectError } = await admin
    .from("accreditation_programs")
    .select(
      "id, organization_id, program_name, transport_modes, accreditation_status, camts_edition, target_survey_date, medical_director, program_director, base_location, notes",
    )
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (selectError) {
    if (isMissingTable(selectError.message)) return null;
    throw new Error(selectError.message);
  }

  if (existing) {
    return existing as AccreditationProgram;
  }

  const { data: created, error: insertError } = await admin
    .from("accreditation_programs")
    .insert({
      organization_id: organizationId,
      program_name: `${organizationName} Medical Transport`,
      camts_edition: "12th Edition",
    })
    .select(
      "id, organization_id, program_name, transport_modes, accreditation_status, camts_edition, target_survey_date, medical_director, program_director, base_location, notes",
    )
    .single();

  if (insertError) {
    if (isMissingTable(insertError.message)) return null;
    throw new Error(insertError.message);
  }

  return created as AccreditationProgram;
}

export async function listPifItems(
  programId: string,
): Promise<AccreditationPifItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("accreditation_pif_items")
    .select("standard_id, status, narrative, evidence_notes, owner_name, updated_at")
    .eq("program_id", programId);

  if (error) {
    if (isMissingTable(error.message)) return [];
    throw new Error(error.message);
  }

  return (data ?? []) as AccreditationPifItem[];
}
