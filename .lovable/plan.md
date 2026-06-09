## Goal

Consolidate the duplicate "Join Premium" page into the existing **Smarty Plans** page (`/smarty-plans`). Keep Smarty Plans exactly as it is — same name, same content, same URL. Remove the standalone Join Premium page and point every link that used to go there to `/smarty-plans` instead. `/premiumbenefits` is untouched.

## Changes

### 1. Routing (`src/App.tsx`)
- Replace the two JoinPremium routes with permanent redirects:
  - `/joinpremium` → `<Navigate to="/smarty-plans" replace />`
  - `/join-premium` → `<Navigate to="/smarty-plans" replace />`
- Remove the lazy `JoinPremium` import (no longer used).

### 2. Delete the page
- Delete `src/pages/JoinPremium.tsx`.

### 3. Update internal links to `/joinpremium` or `/join-premium` → `/smarty-plans`
- `src/pages/About.tsx` (line 577) — "Start your journey" button.
- `src/pages/WhyInvestInSmartyGym.tsx` (line 679) — CTA link.
- `src/pages/FAQ.tsx` (lines 312, 368) — inline anchor links.
- `src/pages/SmartygymVsPeloton.tsx` (line 197) — "Start free trial" button.
- `src/pages/SmartygymVsFreeletics.tsx` (line 198) — "Start free trial" button.
- `src/pages/Index.tsx` (line 722) — hero CTA tile.
- `src/components/seo/BestFitnessSections.tsx` (line 342) — CTA button (keep `data-track-cta="join-premium"` so analytics continue to track).
- `src/components/ui/html-content.tsx` (lines 30–31) — keep `/joinpremium` and `/join-premium` in the safe-link whitelist so any legacy rich-text content still resolves through the redirect.

### 4. SEO / metadata
- `src/utils/seoSchemas.ts` (lines 241, 406) — change `https://smartygym.com/join-premium` URLs to `https://smartygym.com/smarty-plans`.
- `src/utils/seoHelpers.ts` (line 507) — same swap.
- `src/components/seo/BackgroundSEO.tsx` — drop the `/join-premium` entry from the related-links block (line 145) and keep the existing canonical map entries (`/join-premium` → `/smarty-plans`, `/joinpremium` → `/smarty-plans`) which already point the right way.
- `public/sitemap.xml` and `public/llms.txt` — remove the `/join-premium` (and `/joinpremium`) URL entries so search engines stop indexing the retired page; Smarty Plans is already listed.

### 5. Not changed
- `/smarty-plans` page, content, hero heading, name — untouched.
- `/premiumbenefits` page and every existing `navigate("/premiumbenefits")` call — untouched.
- All other functionality, design, SEO components, schemas, analytics tracking attributes (`data-track-cta="join-premium"`) — untouched.

## Result

Every old Join Premium link continues to work (via redirect or direct link rewrite) and lands on Smarty Plans. The duplicate page is gone, SEO points to a single canonical URL, and no design or feature changes are introduced.