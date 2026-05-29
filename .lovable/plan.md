## What already exists (don't rebuild)
- ✅ `scripts/generate-rss.ts` — generates `public/rss.xml` on every `predev`/`prebuild`
- ✅ `<link rel="alternate" type="application/rss+xml">` autodiscovery already in `index.html` (line 131)
- ✅ `scripts/generate-sitemap.ts` — regenerates `public/sitemap.xml` on `predev`/`prebuild`
- ✅ Edge function `refresh-sitemap-ping` — pings Google + Bing `?sitemap=` endpoints and queues IndexNow
- ✅ Edge function `process-indexnow-queue` — submits URLs to IndexNow (Bing/Yandex/Seznam — also picked up by Google)

## What's missing
1. The post-build ping isn't fired automatically — it relies on whatever cron schedule (or nothing) calls `refresh-sitemap-ping`.
2. The RSS feed is autodiscoverable by crawlers, but there's **no visible RSS link** in the footer for humans/readers.

## The plan (purely additive)

### 1. Auto-ping Google + Bing after each build/deploy

Add a small `scripts/ping-search-engines.ts` that:
- Pings the existing `refresh-sitemap-ping` Supabase Edge Function (so the same logic runs from one place: pings Google `?sitemap=`, pings Bing `?sitemap=`, queues IndexNow for content changed in last 24h)
- Falls back to direct GET on the two legacy ping endpoints if the function call fails
- Logs results, never fails the build (exits 0 even on ping errors so deploys aren't blocked)

Wire it in `package.json`:
- Add `"postbuild": "bunx tsx scripts/ping-search-engines.ts || true"`
- The script reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` from the build env

**Belt-and-braces:** also add a daily cron (9:15 UTC) calling `refresh-sitemap-ping` via `pg_cron` so the ping still happens even on days without a deploy. Inserted with the supabase insert tool (per project standard — these are project-specific URLs/keys, not migrations).

**Honest note on Google/Bing ping endpoints:** Google deprecated `google.com/ping?sitemap=` in mid-2023 (it now returns 410). Bing also recommends IndexNow over the legacy ping. The implementation keeps the legacy hits (zero cost, occasionally still consumed by mirrors and aggregators) but **the real discovery happens via**:
- `robots.txt` already advertising the sitemap location (Google's recommended path)
- IndexNow queue submitting individual URLs (covers Bing + Yandex; Microsoft confirmed Google reads IndexNow signals too)
- Google Search Console picks up sitemap changes on its own schedule from `robots.txt`

This combination is the modern equivalent of "ping Google + Bing on deploy."

### 2. Add visible RSS link in the footer

Edit `src/components/Footer.tsx` only:
- Add an `Rss` icon (lucide) next to the existing social icons, linking to `https://smartygym.com/rss.xml` with `aria-label="RSS feed"`, opens in new tab
- Matches existing button style (rounded border, primary color, hover state) — no layout change

Header `<link rel="alternate">` for autodiscovery is already in `index.html` — leave it alone.

## What this does NOT touch
- No changes to existing RSS generation, sitemap generation, IndexNow logic, robots.txt, or any business logic
- No HFSC, layout, pricing, or color changes
- No new tables, no migrations
- Build/deploy continues working even if pings fail

## Verification
1. Run `bunx tsx scripts/ping-search-engines.ts` and confirm it returns ping status for Google + Bing + IndexNow queue count
2. Confirm footer renders the RSS icon and it links to `/rss.xml`
3. Confirm the daily cron job was registered (query `cron.job` via SECURITY DEFINER `get_cron_jobs` function)
4. Report ping results
