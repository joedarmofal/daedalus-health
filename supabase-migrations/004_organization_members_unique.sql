-- organization_members is missing the unique key that both the admin invite
-- upsert and the auto-assign trigger expect.
--
-- App code (app/admin/organizations/actions.ts) upserts with
--   onConflict: "organization_id,user_id"
-- The live table only has PRIMARY KEY (id). PostgREST then returns 42P10:
--   there is no unique or exclusion constraint matching the ON CONFLICT specification
--
-- The trigger in 001_organizations_rls.sql uses ON CONFLICT DO NOTHING on
-- (organization_id, user_id) for the same reason. Run this in the Supabase
-- SQL Editor.

BEGIN;

-- Keep the oldest row if any duplicate memberships already exist.
DELETE FROM organization_members a
USING organization_members b
WHERE a.organization_id = b.organization_id
  AND a.user_id = b.user_id
  AND a.id > b.id;

ALTER TABLE organization_members
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE organization_members
  ADD CONSTRAINT organization_members_organization_id_user_id_key
  UNIQUE (organization_id, user_id);

COMMIT;
