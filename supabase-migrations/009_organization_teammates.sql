-- Let members see teammates in the same organization, without recursive RLS.
-- Required so an org's main contact can manage the team list after intake.
-- Run in the Supabase SQL Editor.

BEGIN;

CREATE OR REPLACE FUNCTION public.user_organization_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.user_organization_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.user_organization_ids() TO authenticated;

DROP POLICY IF EXISTS "Members can view teammates" ON organization_members;
CREATE POLICY "Members can view teammates"
ON organization_members
FOR SELECT
USING (organization_id IN (SELECT public.user_organization_ids()));

COMMIT;
