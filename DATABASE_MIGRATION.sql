-- ============================================
-- RAYGRAPHY.CO DATABASE BOOTSTRAP (FROM SCRATCH)
-- Run this once in Supabase SQL Editor
-- ============================================

-- 0) ADMIN TABLE (used by is_admin)
CREATE TABLE IF NOT EXISTS admins (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1) ADMIN HELPER FUNCTION (uses admins table)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT,
  brand_domain TEXT,
  logo_url TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  facebook_url TEXT,
  favicon_url TEXT,
  hero_banner_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_tagline TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO site_settings (id, brand_name)
VALUES (1, 'Raygraphy')
ON CONFLICT (id) DO NOTHING;

-- 3) PHOTOGRAPHY TYPES
CREATE TABLE IF NOT EXISTS photography_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photography_types_slug ON photography_types(slug);
CREATE INDEX IF NOT EXISTS idx_photography_types_sort_order ON photography_types(sort_order, name);
CREATE INDEX IF NOT EXISTS idx_photography_types_is_active ON photography_types(is_active);

INSERT INTO photography_types (name, slug, is_active, sort_order)
VALUES
  ('Convocation', 'convocation', true, 1),
  ('Wedding', 'wedding', true, 2),
  ('Event', 'event', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- 4) AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  slot_time TIME NULL,
  is_full_day BOOLEAN DEFAULT false,
  service_type TEXT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  note TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) BOOKED DAYS (FULL-DAY EXCEPTIONS ONLY)
CREATE TABLE IF NOT EXISTS booked_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  note TEXT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booked_days_date ON booked_days(date);

-- 6) PACKAGES
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  description TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  highlighted BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7) PORTFOLIO (HOMEPAGE)
CREATE TABLE IF NOT EXISTS portfolio_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NULL,
  alt TEXT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8) GALLERY IMAGES
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

-- 9) FOREIGN KEYS (TYPES)
ALTER TABLE availability_slots
  DROP CONSTRAINT IF EXISTS availability_slots_service_type_fkey;

ALTER TABLE availability_slots
  ADD CONSTRAINT availability_slots_service_type_fkey
  FOREIGN KEY (service_type) REFERENCES photography_types(slug)
  ON UPDATE CASCADE ON DELETE SET NULL;

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

-- 10) RLS ENABLE
ALTER TABLE photography_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- 11) RLS POLICIES (READ PUBLIC, WRITE ADMIN)
-- photography_types
DROP POLICY IF EXISTS photography_types_read ON photography_types;
CREATE POLICY photography_types_read ON photography_types
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS photography_types_insert ON photography_types;
CREATE POLICY photography_types_insert ON photography_types
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS photography_types_update ON photography_types;
CREATE POLICY photography_types_update ON photography_types
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS photography_types_delete ON photography_types;
CREATE POLICY photography_types_delete ON photography_types
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- site_settings
DROP POLICY IF EXISTS site_settings_read ON site_settings;
CREATE POLICY site_settings_read ON site_settings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS site_settings_update ON site_settings;
CREATE POLICY site_settings_update ON site_settings
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- availability_slots (public read, admin write)
DROP POLICY IF EXISTS availability_slots_read ON availability_slots;
CREATE POLICY availability_slots_read ON availability_slots
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS availability_slots_admin_write ON availability_slots;
CREATE POLICY availability_slots_admin_write ON availability_slots
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS availability_slots_admin_update ON availability_slots;
CREATE POLICY availability_slots_admin_update ON availability_slots
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS availability_slots_admin_delete ON availability_slots;
CREATE POLICY availability_slots_admin_delete ON availability_slots
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- booked_days (public read, admin write)
DROP POLICY IF EXISTS booked_days_read ON booked_days;
CREATE POLICY booked_days_read ON booked_days
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS booked_days_insert ON booked_days;
CREATE POLICY booked_days_insert ON booked_days
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS booked_days_update ON booked_days;
CREATE POLICY booked_days_update ON booked_days
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS booked_days_delete ON booked_days;
CREATE POLICY booked_days_delete ON booked_days
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- packages (public read active, admin write)
DROP POLICY IF EXISTS packages_read ON packages;
CREATE POLICY packages_read ON packages
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS packages_admin_write ON packages;
CREATE POLICY packages_admin_write ON packages
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS packages_admin_update ON packages;
CREATE POLICY packages_admin_update ON packages
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS packages_admin_delete ON packages;
CREATE POLICY packages_admin_delete ON packages
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- portfolio_photos (public read active, admin write)
DROP POLICY IF EXISTS portfolio_photos_read ON portfolio_photos;
CREATE POLICY portfolio_photos_read ON portfolio_photos
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS portfolio_photos_admin_write ON portfolio_photos;
CREATE POLICY portfolio_photos_admin_write ON portfolio_photos
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS portfolio_photos_admin_update ON portfolio_photos;
CREATE POLICY portfolio_photos_admin_update ON portfolio_photos
  FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS portfolio_photos_admin_delete ON portfolio_photos;
CREATE POLICY portfolio_photos_admin_delete ON portfolio_photos
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- gallery_images (public read active, admin write)
DROP POLICY IF EXISTS gallery_images_read ON gallery_images;
CREATE POLICY gallery_images_read ON gallery_images
  FOR SELECT
  USING (is_active = true);

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

-- 12) STORAGE POLICIES (gallery + portfolio + site-assets)
-- gallery bucket
DROP POLICY IF EXISTS "gallery public read" ON storage.objects;
CREATE POLICY "gallery public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery admin insert" ON storage.objects;
CREATE POLICY "gallery admin insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "gallery admin update" ON storage.objects;
CREATE POLICY "gallery admin update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'gallery' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "gallery admin delete" ON storage.objects;
CREATE POLICY "gallery admin delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'gallery' AND public.is_admin(auth.uid()));

-- portfolio bucket
DROP POLICY IF EXISTS "portfolio public read" ON storage.objects;
CREATE POLICY "portfolio public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "portfolio admin insert" ON storage.objects;
CREATE POLICY "portfolio admin insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "portfolio admin update" ON storage.objects;
CREATE POLICY "portfolio admin update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'portfolio' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'portfolio' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "portfolio admin delete" ON storage.objects;
CREATE POLICY "portfolio admin delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'portfolio' AND public.is_admin(auth.uid()));

-- site-assets bucket
DROP POLICY IF EXISTS "site-assets public read" ON storage.objects;
CREATE POLICY "site-assets public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "site-assets admin insert" ON storage.objects;
CREATE POLICY "site-assets admin insert" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "site-assets admin update" ON storage.objects;
CREATE POLICY "site-assets admin update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "site-assets admin delete" ON storage.objects;
CREATE POLICY "site-assets admin delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'site-assets' AND public.is_admin(auth.uid()));

-- ============================================
-- BOOTSTRAP ADMIN (MANUAL STEP)
-- ============================================
-- After creating your first auth user, insert their UUID here:
-- INSERT INTO public.admins (user_id) VALUES ('YOUR-USER-UUID') ON CONFLICT DO NOTHING;

-- ============================================
-- NOTES
-- ============================================
-- 1. Create storage buckets in Supabase UI: site-assets, portfolio, gallery (public).
-- 2. Then run the admin insert above.
