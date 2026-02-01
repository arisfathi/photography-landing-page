# Raygraphy.co - Admin Features & UI Improvements Deployment Guide

## Overview
This implementation adds:
- ✅ Admin logo upload via Supabase Storage
- ✅ Admin hero banner customization (image + text)
- ✅ Admin CRUD for Photography Types (Convocation, Wedding, Event, etc.)
- ✅ Mobile UI improvements (centered nav, responsive heading)
- ✅ Database-driven photography types (no hardcoded values)

---

## Part 1: Database Setup

### Step 1: Create Supabase Storage Bucket
1. Go to **Supabase Dashboard** → Your Project → **Storage**
2. Click **Create a new bucket**
3. Name: `site-assets`
4. Public bucket: **Yes** (allow public reads)
5. Click **Create bucket**

### Step 2: Run SQL Migration
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL script from `/docs/MIGRATION.sql` (or the SQL provided below)
4. Click **Run**

**SQL Migration Script:**
```sql
-- Create photography_types table
CREATE TABLE IF NOT EXISTS photography_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_photography_types_slug ON photography_types(slug);
CREATE INDEX idx_photography_types_sort_order ON photography_types(sort_order, name);
CREATE INDEX idx_photography_types_is_active ON photography_types(is_active);

-- Add hero columns to site_settings if missing
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS hero_banner_url TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_tagline TEXT;

-- Insert default photography types
INSERT INTO photography_types (name, slug, is_active, sort_order)
VALUES
  ('Convocation', 'convocation', true, 1),
  ('Wedding', 'wedding', true, 2),
  ('Event', 'event', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE photography_types ENABLE ROW LEVEL SECURITY;

-- RLS: Public read
CREATE POLICY photography_types_read ON photography_types
  FOR SELECT USING (true);

-- RLS: Admin insert
CREATE POLICY photography_types_insert ON photography_types
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- RLS: Admin update
CREATE POLICY photography_types_update ON photography_types
  FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- RLS: Admin delete
CREATE POLICY photography_types_delete ON photography_types
  FOR DELETE USING (public.is_admin(auth.uid()));

-- RLS: Site settings update by admin
CREATE POLICY site_settings_update ON site_settings
  FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- RLS: Site settings public read
CREATE POLICY site_settings_read ON site_settings
  FOR SELECT USING (true);
```

---

## Part 2: Code Files Updated/Created

### Files Created:
1. **`src/lib/storage.ts`** - Supabase Storage upload helper
2. **`src/components/HeroSection.tsx`** - Dynamic hero section using settings
3. **`app/admin/types/page.tsx`** - Photography types CRUD admin page

### Files Modified:
1. **`src/lib/getSettings.ts`** - Added hero_* fields to SiteSettings type
2. **`src/components/Header.tsx`** - Uses logo from settings, centered mobile nav
3. **`src/components/CalendarSection.tsx`** - Centered heading text
4. **`app/page.tsx`** - Uses new HeroSection component
5. **`app/admin/settings/page.tsx`** - Logo and banner image uploads with file inputs
6. **`app/admin/page.tsx`** - Added "Photography Types" nav item
7. **`src/components/PortfolioSection.tsx`** - Fetches types from DB instead of hardcoded

---

## Part 3: Local Testing Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Variables
Make sure your `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Run Locally
```bash
npm run dev
```
Visit `http://localhost:3000`

### Step 4: Test Features

#### A) Test Admin Logo Upload
1. Go to `/admin/login` → sign in with admin account
2. Go to **Settings** page
3. Under "Logo" section, click **Upload Logo Image**
4. Select a PNG/JPG image (recommend square, ~200x200px)
5. Click **Save All Settings**
6. Homepage header should show the new logo ✓

#### B) Test Hero Banner Upload
1. In **Settings** page, under "Hero Section"
2. Click **Upload Hero Banner Image**
3. Select a banner image (recommend 1200x400px or wider)
4. Edit Hero Title, Subtitle, Tagline as desired
5. Click **Save All Settings**
6. Refresh homepage → banner should appear with text overlay ✓

#### C) Test Photography Types CRUD
1. Go to **Admin Dashboard** → **Photography Types**
2. Click **Add Type**
3. Enter name (e.g., "Engagement")
4. Slug auto-generates (e.g., "engagement")
5. Set Display Order: 0
6. Click **Save Type** ✓
7. Try **Edit** and **Delete** buttons ✓
8. Go to homepage Portfolio → category buttons should include new type ✓

#### D) Test UI Improvements
1. **Mobile (375px width)**:
   - Navigation links are **centered horizontally** (flex justify-center)
   - "Check Availability" heading is **centered**
   - Calendar card doesn't overflow ✓
2. **Desktop**:
   - Layout remains unchanged
   - Logo and nav work as before ✓

---

## Part 4: Deployment Steps

### Using Vercel (Recommended)
1. Push to GitHub: `git add . && git commit -m "Add admin features and UI improvements" && git push`
2. Vercel auto-deploys on push
3. Check deployment at your Vercel dashboard

### Manual Deployment
1. Build: `npm run build`
2. Test production build: `npm run start`
3. Deploy to your hosting (Vercel, Netlify, etc.)

---

## Part 5: Troubleshooting

### "site-assets bucket does not exist" error
**Fix**: Create bucket in Supabase Storage UI (see Part 1, Step 1)

### Logo upload fails silently
**Fix**: Check Supabase Storage permissions - bucket must be **public**

### Photography types don't show on homepage
**Fix**: 
- Check database: `SELECT * FROM photography_types;`
- Verify `is_active = true` for types you want to show
- Check RLS policies are applied (see SQL migration)

### Mobile nav not centered
**Fix**: Check Header.tsx line with `justify-center` class is applied to mobile nav div

### Hero banner image doesn't appear
**Fix**:
- Verify image URL is valid (test in browser)
- Check `hero_banner_url` is not null in site_settings table
- Try uploading a different image format (PNG/JPG)

---

## Part 6: Admin Workflows

### Changing Logo
1. `/admin/settings` → Logo section → Upload new image → Save

### Customizing Hero Banner
1. `/admin/settings` → Hero Section → Upload image + edit title/subtitle/tagline → Save

### Managing Photography Types
1. `/admin/types` → Add/Edit/Delete types
2. Types show on homepage automatically
3. Default fallback: Convocation, Wedding, Event (if no types exist)

---

## Key Features Summary

| Feature | Location | Notes |
|---------|----------|-------|
| Logo Upload | `/admin/settings` | Stored in `site_settings.logo_url` |
| Hero Banner | `/admin/settings` | Image + text customization |
| Photography Types | `/admin/types` | CRUD interface, shown on portfolio |
| Mobile Nav | Header component | Centered flex layout |
| Responsive Hero | `HeroSection` component | Mobile-optimized banner |

---

## Database Schema

### `photography_types` table
```sql
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, UNIQUE)
- is_active (BOOLEAN)
- sort_order (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `site_settings` table (new columns)
```sql
- hero_banner_url (TEXT)
- hero_title (TEXT)
- hero_subtitle (TEXT)
- hero_tagline (TEXT)
```

---

## Next Steps (Optional)

- Add image optimization for hero banners
- Implement drag-to-reorder for photography types
- Add bulk operations for types
- Create type templates (icons/colors)

---

## Support

For issues, check:
1. Browser console for errors
2. Supabase logs for API errors
3. RLS policies are correctly set
4. Storage bucket is public

