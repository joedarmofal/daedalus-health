-- Public information-request leads from the landing page form.
-- Run in the Supabase SQL Editor.

BEGIN;

CREATE TABLE IF NOT EXISTS information_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text,
  organization_name text NOT NULL,
  organization_type text,
  organization_size text,
  state text,
  interest text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE information_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view information requests"
ON information_requests
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

COMMIT;
