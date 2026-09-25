-- Fixes the "Organizations" (capitalized) vs "organizations" (lowercase) table-name
-- mismatch that made the app's queries return nothing, enables RLS (previously
-- disabled, which exposed all orgs/memberships to any authenticated caller via
-- the REST API), and adds the policies + auto-assign trigger needed by the app.
--
-- NOTE: this file documents a migration that was applied directly via the
-- Supabase SQL Editor. If you are running this fresh, verify first that
-- organization_members.organization_id has a foreign key to organizations.id
-- and a UNIQUE constraint on (organization_id, user_id) -- both are required
-- for the PostgREST embedding used in lib/org-access.ts and lib/org.ts, and
-- for the trigger's ON CONFLICT DO NOTHING, respectively.

BEGIN;

-- 1. Rename table to lowercase to match app code (org-access.ts uses "organizations")
ALTER TABLE "Organizations" RENAME TO organizations;

-- 2. Enable RLS on both tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 3. Let a user see orgs they belong to
CREATE POLICY "Users can view their own organizations"
ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- 4. Let a user see their own membership rows (needed for the !inner join in org-access.ts)
CREATE POLICY "Users can view their own memberships"
ON organization_members
FOR SELECT
USING (user_id = auth.uid());

-- 5. Super admins can see everything (both tables)
CREATE POLICY "Super admins can view all organizations"
ON organizations
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Super admins can view all memberships"
ON organization_members
FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

-- 6. Clean, working version of the auto-assign trigger
CREATE OR REPLACE FUNCTION auto_assign_super_admin_to_new_org()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.organization_members (organization_id, user_id, role)
  SELECT NEW.id, u.id, 'admin'
  FROM auth.users u
  WHERE (u.raw_app_meta_data->>'is_super_admin')::boolean = true
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_assign_super_admin ON organizations;
CREATE TRIGGER trigger_auto_assign_super_admin
AFTER INSERT ON organizations
FOR EACH ROW
EXECUTE FUNCTION auto_assign_super_admin_to_new_org();

COMMIT;
