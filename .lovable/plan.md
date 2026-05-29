## What's already in place (no new infra needed)

- DB triggers `queue_workout_for_indexnow`, `queue_program_for_indexnow`, `queue_article_for_indexnow` already push every new/newly-visible workout, program, and blog article into `public.indexnow_queue`.
- Edge function `process-indexnow-queue` already drains that queue (batches of 100) and submits URLs to Bing + Yandex IndexNow.
- What's missing is a scheduled job that calls that drainer — and visibility/control of it in the admin Cron panel.

## Part 1 — Finish the 58 workouts today

- Confirmed: 463 of 521 workouts have SEO metadata in `seo_metadata`; **58 still missing**.
- Call `refresh-seo-metadata` in **3 small batches** today, each well under the 150s Edge timeout (~20 workouts × ~2s each ≈ 40s per call). Wait for each batch to finish before the next.
- After the third run, verify `SELECT count(*) FROM admin_workouts WHERE is_visible=true AND id NOT IN (SELECT content_id FROM seo_metadata WHERE content_type='workout')` returns 0.
- No code changes required — just running the existing function until the backlog hits zero.

## Part 2 — Event-driven IndexNow auto-ping cron

Approach: pg_cron cannot fire "on row insert" — Postgres triggers already do that, and they already populate `indexnow_queue` the moment any new workout, program, or article goes live. We just need a frequent drain.

**New cron job**: `process-indexnow-queue-frequent`
- Schedule: `*/5 * * * *` (every 5 minutes — practically "as soon as new content is added")
- Calls: existing `process-indexnow-queue` edge function
- Behavior: if queue is empty it returns instantly; if anything was added in the last 5 minutes it gets pinged to Bing + Yandex automatically
- Category: `maintenance` (alongside the other SEO jobs)

**Registered in the admin panel** (`cron_job_metadata` table → shows in your Cron Jobs admin section) with:
- `display_name`: "IndexNow Auto-Ping (new content)"
- `description`: "Drains the IndexNow queue every 5 min and submits any new/updated workout, program, or article URLs to Bing & Yandex."
- `is_critical`: true
- Fully editable / pausable / deletable from the admin Cron panel via the existing `manage-cron-jobs` function

**Optional cleanup**: leave the existing weekly `refresh-seo-weekly` cron in place — it does a different job (generates SEO metadata for newly-added items + regenerates sitemap). It is NOT the IndexNow ping. If you want it removed, say so and I'll delete it from the same panel.

## Implementation steps (in build mode)

1. Run `refresh-seo-metadata` 3× to clear the 58-workout backlog and verify count = 0.
2. Insert a row in `cron_job_metadata` for `process-indexnow-queue-frequent`.
3. Call `manage-cron-jobs` with `action: 'sync'` for that job_name → registers it in pg_cron.
4. Verify it shows up in the admin Cron Jobs panel and that the next run drains any pending queue rows.

## Out of scope

- No new tables, no new triggers (the auto-queue triggers already exist).
- No changes to the workout/program/article publishing flow.
- No touching of HFSC-related assets.
