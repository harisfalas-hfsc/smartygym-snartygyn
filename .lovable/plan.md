## Findings from the audit

The current problem is systemic, not one broken blog article.

1. **Google Search Console sees the sitemap but indexes 0 submitted URLs**
   - Search Console API reports:
     - `sitemap.xml` submitted: **640 URLs**
     - indexed: **0**
     - sitemap errors: **0**

2. **The `.html` URLs are mostly correct**
   - Example: `https://smartygym.com/blog/amrap-vs-emom-vs-tabata-which-is-best.html`
   - Returns `200`, `text/html`, correct title, correct canonical, correct H1/content.

3. **The clean URLs are still wrong on the live domain**
   - Example: `https://smartygym.com/blog/amrap-vs-emom-vs-tabata-which-is-best`
   - Returns `200`, but serves the **homepage SEO shell**:
     - title: `SmartyGym | Online Fitness Platform by Haris Falas`
     - canonical: `https://smartygym.com/`
     - H1: homepage H1
   - Same issue confirmed for workouts and tools.

4. **The previous `_redirects` approach is not reliable on the live host**
   - The code writes `_redirects`, but the live clean URLs are not redirecting to `.html`.
   - So the build currently passes locally while the deployed website is still wrong for Google.

5. **The sitemap still includes some utility/private URLs**
   - Routes like auth/reset/newsletter pages should not be in the indexable sitemap if robots blocks or noindexes them.

## Plan to fix it properly

### 1. Choose one canonical URL system and enforce it everywhere
Use `.html` as the canonical public URL format for all indexable pages until the hosting layer reliably serves clean URLs with correct static HTML.

That means these must all agree:
- sitemap URLs
- canonical tags
- Open Graph URLs
- prerendered HTML files
- internal links to public SEO pages
- generated breadcrumbs
- runtime route handling

No mixed clean/`.html` system.

### 2. Fix clean URL damage instead of pretending redirects work
Since live `_redirects` is not working, I will add a client-side safety redirect for public SEO routes:

```text
/blog/article-slug        -> /blog/article-slug.html
/workout/type/slug        -> /workout/type/slug.html
/trainingprogram/type/slug -> /trainingprogram/type/slug.html
/tools/bmr-calculator     -> /tools/bmr-calculator.html
/about                    -> /about.html
```

The existing route normalization will still let React render `.html` URLs correctly, but the browser URL and canonical target will be the same `.html` URL.

### 3. Remove non-indexable utility pages from the sitemap
Remove from `scripts/lib/seo-routes.ts` sitemap generation:
- `/auth`
- `/reset-password`
- `/newsletter-thank-you`
- `/premium-comparison`
- `/premiumcomparison`
- any private/admin/success/unsubscribe route that should not be indexed

These can still exist in the app; they just should not be submitted to Google as public content pages.

### 4. Make internal public links use the canonical `.html` URLs
Add a central SEO URL helper and update public-facing generated links for:
- blog list/article links
- workout category/detail links
- training program category/detail links
- tool links
- static public nav/footer links where appropriate
- prerendered breadcrumb/body links

This prevents Google from discovering clean URLs from inside the site.

### 5. Strengthen build verification so it cannot lie again
Update the verification scripts so the build fails if:
- any sitemap URL lacks a matching prerendered `.html` file
- any prerendered page has homepage title/canonical by mistake
- any page has more than one canonical
- any blog/workout/program page lacks real H1/body content
- any blocked/private route appears in sitemap
- dynamic counts suddenly drop below safe thresholds

Also remove false confidence around `_redirects` as the main fix, because live testing proved it is not enough.

### 6. Add a real live-domain SEO audit script
Create a post-publish audit script that checks the actual live website, not just `dist`.

It will test samples across:
- homepage
- blog index
- blog articles
- workout categories
- individual workouts
- training program categories
- individual training programs
- tools
- about/coach/legal pages

For each sampled URL it will verify:
- HTTP status is `200`
- content type is `text/html`
- title is not the homepage title unless it is the homepage
- canonical equals the expected sitemap URL
- H1 exists and is not the homepage H1 on non-home pages
- page contains real prerendered content
- robots are not blocking it

It will also test clean URL counterparts and report whether they redirect/render to the canonical `.html` page.

### 7. Re-submit and re-check in Google Search Console after publish
After the code is implemented and published, I will use the Search Console connector to:
- confirm verified property access
- re-submit `https://smartygym.com/sitemap.xml`
- re-read sitemap status
- confirm Google can download it with zero sitemap errors
- report the submitted URL count again

### 8. Final acceptance checklist before saying “done”
I will not say done until these pass:

```text
Local build verification: PASS
Generated sitemap count: PASS
No blocked/private URLs in sitemap: PASS
Representative .html pages live: PASS
Representative clean URLs handled safely: PASS
Google Search Console sitemap status: PASS
Report delivered with exact tested URLs: PASS
```

## Files expected to change

- `scripts/lib/seo-routes.ts`
- `scripts/lib/seo-render.ts`
- `scripts/verify-prerender.ts`
- `scripts/prerender.ts` if needed
- `src/App.tsx`
- selected public link components/pages that generate clean links
- possibly a new `scripts/audit-live-seo.ts`

No workout/program/blog content will be deleted. This is an SEO routing, sitemap, canonical, and verification fix.