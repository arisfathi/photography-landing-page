# 1. Project Title

## Raygraphy Pages

# 2. Project Description

Raygraphy Pages is a Next.js photography website with a Supabase-backed admin dashboard.

The public site lets visitors:
- Browse photography categories and portfolio highlights
- View a full gallery with category filters
- Check date availability
- Start booking inquiries through WhatsApp

The admin area lets authenticated admins manage:
- Site branding and hero content
- Photography types (dynamic categories)
- Portfolio photos
- Gallery images
- Service packages
- Booked dates

# 3. Key Features

- Dynamic homepage sections powered by Supabase data
- Full admin dashboard under `/admin` with login + admin checks
- Media uploads to Supabase Storage buckets
- Availability calendar with booked-day persistence
- Package selection flow integrated with WhatsApp booking message
- SEO-focused metadata, robots, sitemap, Open Graph, and JSON-LD schemas
- Static export support (`output: "export"`) for static hosting

# 4. Tech Stack

- Language: TypeScript
- Framework: Next.js 16 (App Router), React 19
- Styling: Tailwind CSS v4
- Backend/API: Supabase (Auth, PostgREST tables, RPC, Storage)
- Icons: Remix Icons React
- Linting: ESLint + `eslint-config-next`

# 5. Architecture Overview

High-level flow:

1. Users access public routes (`/`, `/gallery`).
2. Client components fetch content directly from Supabase using the JS client (`@supabase/supabase-js`).
3. Admin routes (`/admin/*`) validate session and admin privileges via:
   - Supabase Auth session
   - Custom RPC: `is_admin(uid)`
4. CRUD operations update Supabase tables, and media is stored in Supabase Storage buckets.
5. Public pages read active data (packages, portfolio, gallery, booked dates, settings) and render UI.

Architecture notes:

- There are no custom Next.js API routes in this repository.
- The app uses direct Supabase client access from browser/client components.
- Root layout also fetches `site_settings` for metadata/favicon behavior.

# 6. Installation Instructions

## Prerequisites

- Node.js 20+ (recommended)
- npm
- A Supabase project

## Steps

```bash
git clone <your-repo-url>
cd raygraphy_pages
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

# 7. Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_SITE_VERIFICATION=google-search-console-verification-token
# Optional alternative key used by metadata fallback:
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

Supabase requirements:

- Tables expected by code:
  - `site_settings`
  - `photography_types`
  - `portfolio_photos`
  - `packages`
  - `gallery_images`
  - `booked_days`
- RPC function:
  - `is_admin(uid)` (returns boolean)
- Storage buckets:
  - `site-assets`
  - `portfolio`
  - `gallery`

Important config note:

- `next.config.ts` allows remote images from one Supabase host. If your Supabase project URL uses a different hostname, update `images.remotePatterns`.

# 8. Usage Instructions

## Development

```bash
npm run dev
```

## Lint

```bash
npm run lint
```

## Build (Static Export)

```bash
npm run build
```

Build output is generated in `out/` due to `output: "export"`.

Serve static output locally (example):

```bash
npx serve out
```

## Admin Access

- Go to `/admin/login`
- Sign in with a Supabase Auth user
- User must pass `is_admin(uid)` check to access admin modules

# 9. API or Core Modules Explanation

This project uses Supabase directly as its backend API.

Core modules in `src/lib`:

- `supabaseClient.ts`: Central Supabase client initialization.
- `auth.ts`: Session, sign-in, sign-out, and admin RPC check.
- `storage.ts`: File upload/delete helpers for Storage buckets.
- `getSettings.ts`: Reads site-wide branding/contact/hero settings.
- `getPhotographyTypes.ts`: Fetches active photography categories.
- `seo.ts`: SEO constants, metadata builders, JSON-LD helpers.

Primary data usage by feature:

- Home layout/branding: `site_settings`
- Category system: `photography_types`
- Portfolio section: `portfolio_photos`
- Packages section: `packages`
- Gallery page: `gallery_images`
- Availability calendar: `booked_days`
- Admin authorization: Supabase Auth + `is_admin(uid)` RPC

# 10. Project Folder Structure

```text
raygraphy_pages/
|-- app/
|   |-- page.tsx                  # Public homepage route
|   |-- layout.tsx                # Root layout + global metadata/schema
|   |-- gallery/                  # Public gallery route
|   |-- admin/                    # Admin dashboard and management pages
|   |   |-- login/
|   |   |-- availability/
|   |   |-- gallery/
|   |   |-- portfolio/
|   |   |-- packages/
|   |   |-- settings/
|   |   |-- types/
|   |-- robots.ts                 # Robots policy
|   |-- sitemap.ts                # Sitemap generation
|-- src/
|   |-- components/               # Reusable UI sections/components
|   |-- lib/                      # Supabase, auth, SEO, and helper modules
|   |-- data/                     # Reserved (currently empty)
|-- public/                       # Static assets (logo, OG, icons)
|-- .env.example                  # Environment template
|-- next.config.ts                # Next config (static export, image host allowlist)
|-- package.json                  # Scripts + dependencies
```

Notes:

- `app/services/[slug]/` exists but is currently empty (reserved for future service pages).
- `src/data/` currently has no committed files.

# 11. Example Screenshots or Demo

No screenshot/demo assets are currently committed in this repository.

Suggested additions:

- Homepage screenshot
- Gallery page screenshot
- Admin dashboard screenshot

You can place them under `docs/screenshots/` and reference them here.

# 12. Contribution Guidelines

1. Fork the repository and create a feature branch.
2. Keep changes focused and scoped to one feature/fix.
3. Run lint before opening a PR:
   ```bash
   npm run lint
   ```
4. If you change Supabase schema or storage rules, document it in the PR.
5. Update README/docs for any behavior or setup changes.

# 13. License

No `LICENSE` file is currently present in this repository.

Until a license is added by maintainers, treat this codebase as all rights reserved.
