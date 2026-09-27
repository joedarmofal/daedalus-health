-- Per-organization EMS/HEMS policy library.
-- Run in the Supabase SQL Editor.

BEGIN;

CREATE TABLE IF NOT EXISTS emergency_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'clinical',
  status text NOT NULL DEFAULT 'draft',
  purpose text,
  body text,
  owner_name text,
  review_date date,
  source_notes text,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS emergency_policies_organization_id_idx
  ON emergency_policies (organization_id, updated_at DESC);

ALTER TABLE emergency_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their emergency policies"
ON emergency_policies
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can insert their emergency policies"
ON emergency_policies
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can update their emergency policies"
ON emergency_policies
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Members can delete their emergency policies"
ON emergency_policies
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE OR REPLACE FUNCTION set_emergency_policies_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_emergency_policies_updated_at ON emergency_policies;
CREATE TRIGGER trigger_emergency_policies_updated_at
BEFORE UPDATE ON emergency_policies
FOR EACH ROW
EXECUTE FUNCTION set_emergency_policies_updated_at();

COMMIT;
