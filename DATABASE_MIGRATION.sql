-- ============================================
-- RAYGRAPHY.CO DATABASE MIGRATION (TYPES + FKs)
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

-- 1b. ENSURE SLUG IS UNIQUE (SAFE IF ALREADY EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'photography_types_slug_key'
  ) THEN
    ALTER TABLE photography_types
      ADD CONSTRAINT photography_types_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_photography_types_slug ON photography_types(slug);
CREATE INDEX IF NOT EXISTS idx_photography_types_sort_order ON photography_types(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_photography_types_is_active ON photography_types(is_active);

-- 3. NORMALIZE EXISTING VALUES TO SLUG FORMAT (LOWERCASE, SPACES -> HYPHEN)
UPDATE availability_slots
SET service_type = lower(regexp_replace(trim(service_type), '\s+', '-', 'g'))
WHERE service_type IS NOT NULL;

UPDATE packages
SET category = lower(regexp_replace(trim(category), '\s+', '-', 'g'))
WHERE category IS NOT NULL;

UPDATE portfolio_photos
SET category = lower(regexp_replace(trim(category), '\s+', '-', 'g'))
WHERE category IS NOT NULL;

-- 4. INSERT DEFAULT PHOTOGRAPHY TYPES
INSERT INTO photography_types (name, slug, is_active, sort_order)
VALUES
  ('Convocation', 'convocation', true, 1),
  ('Wedding', 'wedding', true, 2),
  ('Event', 'event', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 5. ADD FOREIGN KEYS (SAFE IF THEY ALREADY EXIST)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'availability_slots_service_type_fkey'
  ) THEN
    ALTER TABLE availability_slots
      ADD CONSTRAINT availability_slots_service_type_fkey
      FOREIGN KEY (service_type) REFERENCES photography_types(slug)
      ON UPDATE CASCADE ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'packages_category_fkey'
  ) THEN
    ALTER TABLE packages
      ADD CONSTRAINT packages_category_fkey
      FOREIGN KEY (category) REFERENCES photography_types(slug)
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'portfolio_photos_category_fkey'
  ) THEN
    ALTER TABLE portfolio_photos
      ADD CONSTRAINT portfolio_photos_category_fkey
      FOREIGN KEY (category) REFERENCES photography_types(slug)
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. ADD HERO + SOCIAL COLUMNS TO SITE_SETTINGS
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_banner_url TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_tagline TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- 7. ENABLE RLS ON PHOTOGRAPHY_TYPES
ALTER TABLE photography_types ENABLE ROW LEVEL SECURITY;

-- 8. RLS POLICY: ANYONE CAN READ TYPES
DROP POLICY IF EXISTS photography_types_read ON photography_types;
CREATE POLICY photography_types_read ON photography_types
  FOR SELECT
  USING (true);

-- 9. RLS POLICY: ONLY ADMINS CAN INSERT
DROP POLICY IF EXISTS photography_types_insert ON photography_types;
CREATE POLICY photography_types_insert ON photography_types
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- 10. RLS POLICY: ONLY ADMINS CAN UPDATE
DROP POLICY IF EXISTS photography_types_update ON photography_types;
CREATE POLICY photography_types_update ON photography_types
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. RLS POLICY: ONLY ADMINS CAN DELETE
DROP POLICY IF EXISTS photography_types_delete ON photography_types;
CREATE POLICY photography_types_delete ON photography_types
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- 12. RLS POLICY: SITE_SETTINGS UPDATE (ADMIN ONLY)
DROP POLICY IF EXISTS site_settings_update ON site_settings;
CREATE POLICY site_settings_update ON site_settings
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 13. RLS POLICY: SITE_SETTINGS READ (PUBLIC)
DROP POLICY IF EXISTS site_settings_read ON site_settings;
CREATE POLICY site_settings_read ON site_settings
  FOR SELECT
  USING (true);

-- ============================================
-- VERIFICATION QUERIES (RUN AFTER MIGRATION)
-- ============================================

-- SELECT name, slug, is_active, sort_order FROM photography_types ORDER BY sort_order, name;
-- SELECT DISTINCT service_type FROM availability_slots ORDER BY service_type;
-- SELECT DISTINCT category FROM packages ORDER BY category;
-- SELECT DISTINCT category FROM portfolio_photos ORDER BY category;

-- ============================================
-- NOTES
-- ============================================
-- 1. Make sure the "site-assets" storage bucket exists in Supabase UI
-- 2. public.is_admin() must exist

-- ============================================
-- GALLERY IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  category TEXT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_images_sort ON gallery_images(sort_order, created_at);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gallery_images_read ON gallery_images;
CREATE POLICY gallery_images_read ON gallery_images
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS gallery_images_insert ON gallery_images;
CREATE POLICY gallery_images_insert ON gallery_images
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS gallery_images_update ON gallery_images;
CREATE POLICY gallery_images_update ON gallery_images
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS gallery_images_delete ON gallery_images;
CREATE POLICY gallery_images_delete ON gallery_images
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ============================================
-- CASCADE DELETE: PHOTOGRAPHY TYPES -> PACKAGES + PORTFOLIO
-- ============================================

ALTER TABLE packages
  DROP CONSTRAINT IF EXISTS packages_category_fkey;

ALTER TABLE packages
  ADD CONSTRAINT packages_category_fkey
  FOREIGN KEY (category) REFERENCES photography_types(slug)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE portfolio_photos
  DROP CONSTRAINT IF EXISTS portfolio_photos_category_fkey;

ALTER TABLE portfolio_photos
  ADD CONSTRAINT portfolio_photos_category_fkey
  FOREIGN KEY (category) REFERENCES photography_types(slug)
  ON UPDATE CASCADE ON DELETE CASCADE;
