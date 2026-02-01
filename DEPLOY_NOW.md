# 🚀 DEPLOYMENT CHECKLIST - Raygraphy.co Admin Features

## PRE-DEPLOYMENT (Must Do First)

### ☑️ Database Migration
1. **Go to**: Supabase Dashboard → SQL Editor
2. **Copy**: Entire SQL from `DATABASE_MIGRATION.sql` file (in project root)
3. **Paste**: Into SQL Editor
4. **Run**: Click "Run" button
5. **Verify**: No errors appear
   - Should see "Success" message
   - Check: `SELECT * FROM photography_types;` shows 3 default types

### ☑️ Create Storage Bucket
1. **Go to**: Supabase Dashboard → Storage
2. **Click**: "Create a new bucket"
3. **Name**: `site-assets` (exactly)
4. **Public**: Toggle to YES
5. **Click**: "Create bucket"

### ☑️ Code is Ready
- ✅ All files created/modified
- ✅ No manual code edits needed
- ✅ Just deploy as-is

---

## DEPLOYMENT (Git Push)

```bash
# From project root
git add .
git commit -m "Add admin features: logo upload, hero customization, photography types CRUD"
git push origin main
```

**If using Vercel**: Auto-deploys on push
**If using other hosting**: Deploy your usual way

---

## POST-DEPLOYMENT TESTING

### Test 1: Admin Logo Upload ✓
1. Go to: `https://yourdomain.com/admin/settings`
2. Sign in with admin account
3. Scroll to **"Logo"** section
4. Click **"Upload Logo Image"** button
5. Select a square PNG/JPG (200x200px recommended)
6. Image preview should appear
7. Click **"Save All Settings"**
8. Go to homepage → Check header for new logo
9. **PASS**: Logo updates in header ✓

### Test 2: Admin Hero Banner ✓
1. In `/admin/settings`, scroll to **"Hero Section"**
2. Upload banner image (landscape, 1200x400px recommended)
3. Edit **Hero Title** (e.g., "Your Photography Business")
4. Edit **Hero Subtitle** (e.g., "Beautiful moments captured")
5. Edit **Hero Tagline** (longer description)
6. Click **"Save All Settings"**
7. Go to homepage → Hero shows banner with text
8. **PASS**: Hero updates with custom content ✓

### Test 3: Photography Types CRUD ✓
1. Go to: `https://yourdomain.com/admin/types`
2. Should see 3 default types: Convocation, Wedding, Event

**Add New Type**:
   - Click **"Add Type"**
   - Enter Name: "Engagement"
   - Slug auto-generates: "engagement"
   - Set Order: 0 (or leave default)
   - Click **"Save Type"**
   - Type appears in list ✓

**Edit Type**:
   - Click **"Edit"** on any type
   - Change name to "Weddings & Events"
   - Click **"Save Type"**
   - List updates ✓

**Delete Type**:
   - Click trash icon on any type
   - Confirm deletion
   - Type disappears from list ✓

3. Go to homepage → Portfolio section
4. Category buttons should show your types
5. **PASS**: Portfolio types are dynamic ✓

### Test 4: Mobile Responsiveness ✓
Open on mobile device (or browser dev tools, 375px width):

1. **Header**:
   - Logo visible and sized properly
   - Nav links CENTERED horizontally (not left-aligned)
   - Icons visible on right side
   - No horizontal scrolling ✓

2. **Hero Section**:
   - Banner image full width
   - Text centered, readable
   - No overflow ✓

3. **Calendar**:
   - "Check Availability" heading CENTERED
   - Calendar grid responsive
   - No horizontal scroll ✓

4. **Portfolio**:
   - Category buttons stacked or centered
   - Images responsive ✓

5. **Overall**:
   - Touch-friendly buttons
   - Good padding on mobile
   - No content cut off ✓

---

## VERIFY DEPLOYMENT SUCCESS

### ☑️ Homepage
- [ ] Logo from settings displays in header
- [ ] Hero shows banner (if uploaded) or gradient
- [ ] Portfolio types come from database
- [ ] All links work

### ☑️ Admin Pages
- [ ] `/admin/settings` loads without errors
- [ ] Logo upload works
- [ ] Banner upload works
- [ ] Can save all settings

### ☑️ Admin Types
- [ ] `/admin/types` accessible by admin
- [ ] Can add/edit/delete types
- [ ] Types appear on homepage portfolio
- [ ] Sorting works (by order)

### ☑️ Mobile (375px)
- [ ] Nav links centered
- [ ] No horizontal scroll
- [ ] Hero responsive
- [ ] Calendar heading centered

---

## TROUBLESHOOTING

### ❌ Problem: Logo upload fails
**Solution**:
1. Go to Supabase → Storage
2. Verify `site-assets` bucket exists and is PUBLIC
3. Try uploading smaller image (< 2MB)
4. Check browser console for errors

### ❌ Problem: Hero banner doesn't appear
**Solution**:
1. Check `hero_banner_url` is not null in database
2. Test URL in browser - should load image
3. Try PNG instead of JPG
4. Clear browser cache (Ctrl+Shift+Del)

### ❌ Problem: Photography types not showing
**Solution**:
1. Run this in Supabase SQL Editor:
   ```sql
   SELECT * FROM photography_types WHERE is_active = true;
   ```
2. If empty, run migration again
3. Check RLS policies (should allow public SELECT)

### ❌ Problem: Mobile nav links not centered
**Solution**:
1. Clear browser cache
2. Do hard refresh (Ctrl+Shift+R)
3. Check Header.tsx line ~101 has `justify-center`

### ❌ Problem: Admin pages show "unauthorized"
**Solution**:
1. Verify user is in admin role in auth
2. Check `public.is_admin()` function exists in Supabase
3. Run migration script again

---

## FILES FOR REFERENCE

In project root folder:
- **`QUICK_START.md`** - Quick overview
- **`DEPLOYMENT_GUIDE.md`** - Detailed deployment guide
- **`DATABASE_MIGRATION.sql`** - Copy-paste SQL
- **`COMPLETE_REFERENCE.md`** - Full technical reference
- **`IMPLEMENTATION_COMPLETE.md`** - What was changed

---

## ROLLBACK (If Needed)

To undo database changes:
```sql
-- Drop photography_types table
DROP TABLE IF EXISTS photography_types;

-- Remove columns from site_settings (optional, safe to leave)
-- ALTER TABLE site_settings DROP COLUMN hero_banner_url;
-- etc.
```

To undo code changes:
```bash
git revert HEAD --no-edit
git push origin main
```

---

## SUCCESS METRICS

✅ All tests pass
✅ Admin can upload logo
✅ Admin can customize hero
✅ Admin can CRUD types
✅ Homepage shows updates
✅ Mobile UI is centered/responsive
✅ No console errors
✅ No broken links

---

## NEXT STEPS

1. ✅ Database migration (done)
2. ✅ Storage bucket created (done)
3. ✅ Code deployed (done)
4. ✅ Testing completed (in progress)
5. 🔄 Monitor production
6. 📊 Gather user feedback

---

## SUPPORT

**If you encounter issues**:
1. Check the troubleshooting section above
2. Review `DEPLOYMENT_GUIDE.md`
3. Check browser console (F12)
4. Check Supabase logs
5. Verify RLS policies in Supabase

---

## ESTIMATED TIME

| Task | Time |
|------|------|
| Database migration | 2 minutes |
| Storage bucket | 1 minute |
| Code deployment | 5 minutes |
| Full testing | 15 minutes |
| **TOTAL** | **~25 minutes** |

---

**Status**: 🟢 READY TO DEPLOY

**Last Updated**: 2026-02-01

**Version**: 1.0 (Production Ready)

