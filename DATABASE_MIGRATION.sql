-- ============================================
-- RAYGRAPHY.CO DATABASE MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CREATE PHOTOGRAPHY TYPES TABLE
CREATE TABLE IF NOT EXISTS photography_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_photography_types_slug ON photography_types(slug);
CREATE INDEX IF NOT EXISTS idx_photography_types_sort_order ON photography_types(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_photography_types_is_active ON photography_types(is_active);

-- 3. ADD HERO COLUMNS TO SITE_SETTINGS
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_banner_url TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_tagline TEXT;

-- 4. INSERT DEFAULT PHOTOGRAPHY TYPES
INSERT INTO photography_types (name, slug, is_active, sort_order)
VALUES
  ('Convocation', 'convocation', true, 1),
  ('Wedding', 'wedding', true, 2),
  ('Event', 'event', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 5. ENABLE RLS ON PHOTOGRAPHY_TYPES
ALTER TABLE photography_types ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICY: ANYONE CAN READ ACTIVE TYPES
CREATE POLICY IF NOT EXISTS photography_types_read ON photography_types
  FOR SELECT
  USING (true);

-- 7. RLS POLICY: ONLY ADMINS CAN INSERT
CREATE POLICY IF NOT EXISTS photography_types_insert ON photography_types
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. RLS POLICY: ONLY ADMINS CAN UPDATE
CREATE POLICY IF NOT EXISTS photography_types_update ON photography_types
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. RLS POLICY: ONLY ADMINS CAN DELETE
CREATE POLICY IF NOT EXISTS photography_types_delete ON photography_types
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 10. RLS POLICY: SITE_SETTINGS UPDATE (ADMIN ONLY)
CREATE POLICY IF NOT EXISTS site_settings_update ON site_settings
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. RLS POLICY: SITE_SETTINGS READ (PUBLIC)
CREATE POLICY IF NOT EXISTS site_settings_read ON site_settings
  FOR SELECT
  USING (true);

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Verify photography_types table created
-- SELECT * FROM photography_types;

-- Verify site_settings has new columns
-- SELECT 
--   id, brand_name, logo_url,
--   hero_banner_url, hero_title, hero_subtitle, hero_tagline
-- FROM site_settings
-- WHERE id = 1;

-- Verify default types inserted
-- SELECT name, slug, is_active, sort_order FROM photography_types ORDER BY sort_order;

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure 'site-assets' storage bucket is created separately in Supabase UI
--    Storage → Create Bucket → Name: "site-assets" → Public: YES
--
-- 2. The public.is_admin() function must exist (should already be created)
--    If error, add this function to your Supabase database:
--    
--    CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
--    RETURNS BOOLEAN AS $$
--    BEGIN
--      RETURN EXISTS(
--        SELECT 1 FROM auth.users
--        WHERE id = user_id
--        AND raw_user_meta_data->>'role' = 'admin'
--      );
--    END;
--    $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- 3. After running this migration, verify no errors occurred
-- 4. Test by visiting /admin/types in the application
