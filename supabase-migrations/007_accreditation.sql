-- CAMTS accreditation programs and PIF work items.
-- Run in the Supabase SQL Editor.

BEGIN;

CREATE TABLE IF NOT EXISTS accreditation_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  program_name text NOT NULL,
  transport_modes text[] NOT NULL DEFAULT '{}',
  accreditation_status text,
  camts_edition text NOT NULL DEFAULT '12th Edition',
  target_survey_date date,
  medical_director text,
  program_director text,
  base_location text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accreditation_pif_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES accreditation_programs(id) ON DELETE CASCADE,
  standard_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  narrative text,
  evidence_notes text,
  owner_name text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, standard_id)
);

CREATE INDEX IF NOT EXISTS accreditation_pif_items_program_id_idx
  ON accreditation_pif_items (program_id);

ALTER TABLE accreditation_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_pif_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their accreditation program"
ON accreditation_programs
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can create their accreditation program"
ON accreditation_programs
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can update their accreditation program"
ON accreditation_programs
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can view their PIF items"
ON accreditation_pif_items
FOR SELECT
USING (
  program_id IN (
    SELECT p.id
    FROM accreditation_programs p
    JOIN organization_members m ON m.organization_id = p.organization_id
    WHERE m.user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can insert their PIF items"
ON accreditation_pif_items
FOR INSERT
WITH CHECK (
  program_id IN (
    SELECT p.id
    FROM accreditation_programs p
    JOIN organization_members m ON m.organization_id = p.organization_id
    WHERE m.user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can update their PIF items"
ON accreditation_pif_items
FOR UPDATE
USING (
  program_id IN (
    SELECT p.id
    FROM accreditation_programs p
    JOIN organization_members m ON m.organization_id = p.organization_id
    WHERE m.user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE OR REPLACE FUNCTION set_accreditation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_accreditation_programs_updated_at ON accreditation_programs;
CREATE TRIGGER trigger_accreditation_programs_updated_at
BEFORE UPDATE ON accreditation_programs
FOR EACH ROW
EXECUTE FUNCTION set_accreditation_updated_at();

DROP TRIGGER IF EXISTS trigger_accreditation_pif_items_updated_at ON accreditation_pif_items;
CREATE TRIGGER trigger_accreditation_pif_items_updated_at
BEFORE UPDATE ON accreditation_pif_items
FOR EACH ROW
EXECUTE FUNCTION set_accreditation_updated_at();

COMMIT;
