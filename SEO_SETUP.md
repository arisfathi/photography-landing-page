# SEO and Google Search Console Setup

## 1) Environment variables
Set these values in your deployment environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_SITE_VERIFICATION=...
```

`GOOGLE_SITE_VERIFICATION` is the token from Google Search Console.

## 2) Verify Google Search Console
1. Open Google Search Console.
2. Add property: `https://raygraphy.co`.
3. Choose HTML tag verification.
4. Copy the token value and set `GOOGLE_SITE_VERIFICATION`.
5. Redeploy the site.
6. Click Verify in Search Console.

## 3) Submit sitemap
After deployment, submit:

```
https://raygraphy.co/sitemap.xml
```

`robots.txt` is available at:

```
https://raygraphy.co/robots.txt
```

## 4) Post-deploy checks
1. Confirm admin URLs are excluded by `robots.txt`.
2. Validate structured data in Rich Results Test:
   - Home page (LocalBusiness/WebSite)
   - `/services/{slug}` pages (BreadcrumbList/Service)
3. Run PageSpeed Insights for:
   - `/`
   - `/gallery`
   - `/services/portrait`

