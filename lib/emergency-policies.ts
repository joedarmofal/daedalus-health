import { createAdminClient } from "@/lib/supabase/admin";

export const POLICY_CATEGORIES = [
  { id: "clinical", label: "Clinical" },
  { id: "administrative", label: "Administrative" },
  { id: "operational", label: "Operational" },
] as const;

export const POLICY_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "in_review", label: "In review" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
] as const;

export type PolicyCategory = (typeof POLICY_CATEGORIES)[number]["id"];
export type PolicyStatus = (typeof POLICY_STATUSES)[number]["id"];

export interface EmergencyPolicy {
  id: string;
  organization_id: string;
  title: string;
  category: PolicyCategory;
  status: PolicyStatus;
  purpose: string | null;
  body: string | null;
  owner_name: string | null;
  review_date: string | null;
  source_notes: string | null;
  created_at: string;
  updated_at: string;
}

function isMissingTable(message: string): boolean {
  return /emergency_policies|schema cache|PGRST205/i.test(message);
}

export function policyCategoryLabel(id: string): string {
  return POLICY_CATEGORIES.find((item) => item.id === id)?.label ?? id;
}

export function policyStatusLabel(id: string): string {
  return POLICY_STATUSES.find((item) => item.id === id)?.label ?? id;
}

export async function listEmergencyPolicies(
  organizationId: string,
): Promise<{ policies: EmergencyPolicy[]; tableMissing: boolean }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("emergency_policies")
    .select(
      "id, organization_id, title, category, status, purpose, body, owner_name, review_date, source_notes, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTable(error.message)) {
      return { policies: [], tableMissing: true };
    }
    throw new Error(error.message);
  }

  return { policies: (data ?? []) as EmergencyPolicy[], tableMissing: false };
}

export async function getEmergencyPolicy(
  organizationId: string,
  policyId: string,
): Promise<EmergencyPolicy | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("emergency_policies")
    .select(
      "id, organization_id, title, category, status, purpose, body, owner_name, review_date, source_notes, created_at, updated_at",
    )
    .eq("organization_id", organizationId)
    .eq("id", policyId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error.message)) return null;
    throw new Error(error.message);
  }

  return (data as EmergencyPolicy | null) ?? null;
}
