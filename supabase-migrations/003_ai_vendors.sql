-- Enterprise AI vendor directory, edited from Mission Control.
-- Run in the Supabase SQL Editor. After this applies, open
-- /admin/vendors and use "Import starter directory" once to load the
-- initial list (or add vendors by hand).

BEGIN;

CREATE TABLE IF NOT EXISTS ai_vendor_categories (
  id text PRIMARY KEY,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ai_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL REFERENCES ai_vendor_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, name)
);

ALTER TABLE ai_vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vendor categories"
ON ai_vendor_categories
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view vendors"
ON ai_vendors
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admins can insert vendor categories"
ON ai_vendor_categories
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Super admins can insert vendors"
ON ai_vendors
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Super admins can update vendors"
ON ai_vendors
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE POLICY "Super admins can delete vendors"
ON ai_vendors
FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
);

CREATE OR REPLACE FUNCTION set_ai_vendors_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ai_vendors_updated_at ON ai_vendors;
CREATE TRIGGER trigger_ai_vendors_updated_at
BEFORE UPDATE ON ai_vendors
FOR EACH ROW
EXECUTE FUNCTION set_ai_vendors_updated_at();

INSERT INTO ai_vendor_categories (id, label, description, sort_order) VALUES
  ('ambient-scribes', 'Ambient listening & scribes', 'In-room and virtual documentation that captures the clinician–patient conversation and drafts the note.', 10),
  ('imaging-diagnostics', 'Imaging, pathology & diagnostics', 'Clinically deployed tools that read images, flag acute findings, and support specialty diagnosis.', 20),
  ('clinical-evidence', 'Clinical decision support & evidence', 'Point-of-care knowledge, differential support, and evidence search that sit next to the clinician.', 30),
  ('revenue-cycle', 'Revenue cycle, coding & CDI', 'Autonomous coding, clinical documentation integrity, prior auth, and denial work.', 40),
  ('operations', 'Operations, capacity & care coordination', 'OR, infusion, bed, and ED flow tools that turn operational data into a daily command of capacity.', 50),
  ('patient-engagement', 'Patient engagement & virtual care', 'Outreach, scheduling, navigation, and conversational agents in front of the call center and portal.', 60),
  ('research', 'Research, RWE & precision medicine', 'Datasets, trial matching, and multimodal models for research and precision-oncology programs.', 70),
  ('workforce-hr', 'Workforce & HR', 'Hiring and workforce platforms health systems use to fill clinical and corporate roles.', 80),
  ('legal-compliance', 'Legal, privacy & compliance', 'Counsel, contracting, privacy-program, and security-assurance tools.', 90),
  ('platforms', 'Cloud, EHR & AI platforms', 'The substrate most other tools sit on — EHR-native AI, cloud healthcare APIs, and model infrastructure.', 100)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

COMMIT;
