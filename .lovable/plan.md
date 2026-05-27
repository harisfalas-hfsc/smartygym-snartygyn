
## Current state (verified)

- `scripts/generate-sitemap.ts` already runs on every `predev` and `prebuild`, writes `public/sitemap.xml`, and pulls live rows from `admin_workouts`, `admin_training_programs`, and `blog_articles`. Current output: **564 URLs** including every visible workout (506 — WOD + FREE + ME/CB/etc.), every visible program, every published blog article, all category roots, tools, calculators, legal pages.
- `public/robots.txt` already contains `Sitemap: https://smartygym.com/sitemap.xml` (and image sitemap).
- `react-helmet` is in use across all 38 public page components except **`WODArchive.tsx`** (only public page missing a Helmet block; the other 6 misses are admin/printable/NotFound and must stay out of SEO).
- `supabase/functions/indexnow-ping/index.ts` exists but is **never invoked automatically** — no code path pings it when a workout/program/article is published.

## Gaps to fix

1. **Sitemap freshness between deploys.** Today the file only refreshes on a Lovable deploy. Add a scheduled `pg_cron` (daily 02:00 UTC) that calls a new `refresh-sitemap-ping` edge function which POSTs the current sitemap URL to Google + Bing search-ping endpoints and triggers an IndexNow submit for any URLs created/updated in the last 24h. (We cannot rewrite the static file from an edge function on Lovable hosting; pinging search engines is the correct mechanism.)
2. **Automatic IndexNow on publish.** Add a Postgres trigger on `admin_workouts`, `admin_training_programs`, and `blog_articles` that, on `INSERT` or `UPDATE` flipping to visible/published, enqueues a row in a new `indexnow_queue` table. A second cron (every 5 min) drains the queue by calling `indexnow-ping` with the batched URLs. This guarantees Bing/ChatGPT/Perplexity see new content within minutes with zero manual action.
3. **Missing meta on `WODArchive`.** Add a `<Helmet>` block with proper title + description + canonical.
4. **Sitemap completeness audit.** Add `/about-smartygym` page route to the static list if missing (already present — verified). Confirm the static-entries list matches `src/App.tsx` route-by-route; add any missing public routes I find during the audit pass (e.g. `/smarty-plans` is already there). No new pages need to be created — every static route in `STATIC_ENTRIES` resolves to an existing component in `src/pages/`.
5. **IndexNow key file.** Verify `public/smartygym-indexnow-key.txt` content matches the `INDEXNOW_KEY` used in the edge function (`smartygym-indexnow-key`). Already aligned.

## Technical changes

### A. Edge function: `refresh-sitemap-ping`
- New `supabase/functions/refresh-sitemap-ping/index.ts`.
- POSTs to `https://www.google.com/ping?sitemap=https://smartygym.com/sitemap.xml` and `https://www.bing.com/ping?sitemap=...`.
- Queries `admin_workouts`, `admin_training_programs`, `blog_articles` for rows where `updated_at > now() - interval '24 hours'` and visible/published, then internally calls `indexnow-ping` logic with that URL batch.

### B. Auto-IndexNow pipeline
- Migration creates table `public.indexnow_queue (id, url, content_type, content_id, queued_at, processed_at)` with grants + RLS (`service_role` only).
- Triggers on `admin_workouts`, `admin_training_programs`, `blog_articles` insert URLs into the queue when row becomes publicly visible.
- New edge function `process-indexnow-queue` reads unprocessed rows, batches ≤100, POSTs to `indexnow-ping`, marks `processed_at`.
- `pg_cron` jobs:
  - `process-indexnow-queue` every 5 minutes
  - `refresh-sitemap-ping` once daily 02:00 UTC

### C. WODArchive meta
- Add `<Helmet>` to `src/pages/WODArchive.tsx`:
  - title: "Workout of the Day Archive | SmartyGym"
  - description ≤160 chars, canonical, og:* tags.

### D. Sitemap generator hardening
- Extend `scripts/generate-sitemap.ts` so that when the Supabase fetch fails the build still keeps the previously generated file (current behavior is good; just add comment + ensure FREE-prefixed workouts always slot under correct category — verified working).
- Add `/about-smartygym` is already present. Add `/about` route mapped to `/about-smartygym` redirect — already in static list.

### E. Verification step
- After deploy, run `curl -sI https://smartygym.com/sitemap.xml` and `grep -c "<url>" public/sitemap.xml` and confirm:
  - File served 200.
  - Count matches DB visible totals + static list (workouts 506 + programs N + blog N + ~55 static).
  - `robots.txt` contains correct Sitemap line.
  - Pages missing Helmet limited to admin/printable only.
- Manually invoke `refresh-sitemap-ping` once to confirm Google + Bing acknowledge.
- Insert a test blog row → confirm queue picks it up → confirm `indexnow-ping` returns success.

## Out of scope (per your earlier standing rules)

- No visual or style changes anywhere.
- HFSC content untouched.
- No changes to existing route components beyond adding the `<Helmet>` block to `WODArchive`.

## Deliverable

A single markdown report at `/mnt/documents/sitemap-seo-indexnow-report.md` listing: total URLs in sitemap by category, robots.txt verification, per-page Helmet audit table, trigger/cron list, and curl verification output.
