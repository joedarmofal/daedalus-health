-- Store the member's real name on organization_members so the membership
-- row can be associated with the name captured on new-customer / intake.
-- Run in the Supabase SQL Editor.

BEGIN;

ALTER TABLE organization_members
  ADD COLUMN IF NOT EXISTS full_name text;

-- Members can update their own name (intake writes this after setup).
DROP POLICY IF EXISTS "Users can update their own membership name" ON organization_members;
CREATE POLICY "Users can update their own membership name"
ON organization_members
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Backfill from the intake record submitted by that member.
UPDATE organization_members m
SET full_name = trim(i.primary_contact_name)
FROM organization_intake i
WHERE i.organization_id = m.organization_id
  AND i.submitted_by = m.user_id
  AND m.full_name IS NULL
  AND i.primary_contact_name IS NOT NULL
  AND trim(i.primary_contact_name) <> '';

-- Then from auth user metadata (set when the invite was generated).
UPDATE organization_members m
SET full_name = trim(u.raw_user_meta_data->>'full_name')
FROM auth.users u
WHERE u.id = m.user_id
  AND m.full_name IS NULL
  AND u.raw_user_meta_data->>'full_name' IS NOT NULL
  AND trim(u.raw_user_meta_data->>'full_name') <> '';

COMMIT;
