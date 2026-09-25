-- Adds what's needed for admin-driven customer onboarding + intake.
-- Run in the Supabase SQL Editor. Wrapped in a transaction so it's all-or-nothing.

BEGIN;

-- 1. A couple of convenience columns on organizations for the admin list view
--    (avoids joining to auth.users, which the anon/authenticated roles can't query directly).
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS primary_contact_email text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- 2. Super admins need to be able to create organizations from the admin panel.
--    (Not strictly required if org creation always goes through the service-role
--    client server-side, but added for defense-in-depth.)
CREATE POLICY "Super admins can create organizations"
ON organizations
FOR INSERT
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

-- 3. The intake record itself: one row per organization.
CREATE TABLE IF NOT EXISTS organization_intake (
  organization_id uuid PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  health_system_type text,
  org_size text,
  ehr_vendor text,
  primary_use_cases text[] NOT NULL DEFAULT '{}',
  governance_maturity text,
  primary_contact_name text,
  primary_contact_title text,
  primary_contact_email text,
  primary_contact_phone text,
  additional_stakeholders text,
  notes text,
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organization_intake ENABLE ROW LEVEL SECURITY;

-- Members of an org can view/submit/update their own org's intake record.
CREATE POLICY "Members can view their org intake"
ON organization_intake
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can submit their org intake"
ON organization_intake
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Members can update their org intake"
ON organization_intake
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Super admins can see every org's intake in the admin panel.
CREATE POLICY "Super admins can view all intake"
ON organization_intake
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

-- 4. Keep updated_at honest on edits.
CREATE OR REPLACE FUNCTION set_organization_intake_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_organization_intake_updated_at ON organization_intake;
CREATE TRIGGER trigger_organization_intake_updated_at
BEFORE UPDATE ON organization_intake
FOR EACH ROW
EXECUTE FUNCTION set_organization_intake_updated_at();

COMMIT;
