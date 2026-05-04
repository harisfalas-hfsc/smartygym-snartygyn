## Goal

Replace the narrow "Tomorrow Ready?" check with a comprehensive **"Future Ready?"** audit that inspects the entire WOD generation pipeline, persists every run, and tells you when an issue is **recurring** (same failure as a previous day).

## What's wrong today (quick recap)

The current check looks for a cron job named `generate-workout-of-day`, which no longer exists. The actual jobs are `generate-wod-bodyweight-daily` (21:05 UTC) and `generate-wod-equipment-daily` (21:25 UTC), both active. So the ❌ you saw is a false alarm — the system IS generating WODs, today's exists, and the last 3 runs succeeded.

## Plan

### Step 1 — Create a persistent memory table

New table `wod_readiness_audits`:
- `audit_date`, `triggered_by` (manual / cron), `overall_status` (`healthy` / `warnings` / `critical`)
- `total_checks`, `passed`, `warnings`, `failed`
- `results` (jsonb, full per-check details)
- `failed_check_keys` (text[]) — stable IDs like `cron_inactive`, `image_missing`, `stripe_missing` for quick recurrence matching
- `notes` (auto-generated recurrence summary)

This lets the next run say things like: *"⚠️ This same issue (`stripe_missing`) also failed yesterday and 2 days ago — recurring problem."*

### Step 2 — Rename and expand the check

Rename button **"Tomorrow Ready?" → "Future Ready?"**. Replace its logic with a full system audit covering every layer of the WOD philosophy:

**A. Cron infrastructure (fix the false alarm)**
- Look up the real jobs in `cron_job_metadata`: `generate-wod-bodyweight-daily`, `generate-wod-equipment-daily`, `archive-old-wods`, `backup-wod-generation`, `watchdog-wod-check`, `send-morning-notifications-job`, `daily-system-health-audit-after-generation`.
- For each: confirm `is_active = true` and that the schedule hasn't drifted from the expected time.
- Confirm bodyweight cron fires before equipment cron (the Plan C+D sequential ordering that prevents the 150s timeout).

**B. Generation history (catch recurring failures)**
- Read last 7 days from `wod_generation_runs`.
- Flag missing days, failures, partial generations (`found_count < expected_count`).
- Compute success rate over the last week; warn if < 100%.

**C. Today's WOD integrity (the existing 5 checks, kept)**
- Right number of WODs for today (1 for Recovery, 2 otherwise).
- All have `image_url`.
- All have `stripe_product_id` + `stripe_price_id`.
- Category matches the 84-day periodization for today.
- Difficulty stars within today's expected range.

**D. Forward-looking periodization (next 7 days)**
- Compute the expected category + difficulty for each of the next 7 days from the 84-day cycle.
- Show the upcoming sequence so you can verify Recovery days, Strength days, etc. land on the right dates.

**E. Library health (so generation has materials)**
- Count active exercises per category vs. minimum thresholds (Pilates studio equipment, micro-workout bodyweight, Tabata no-machines, etc.).
- Warn if a category is at risk of running out of unique combinations.

**F. Stripe & image pipelines**
- Last 7 days of WODs: any missing `stripe_product_id` or `image_url`?
- Last `sync-stripe-images-weekly` cron run timestamp present?

**G. Auto-gen config consistency**
- `wod_auto_generation_config.generation_hour_utc/minute_utc` matches the actual cron schedules.
- WOD state row exists and looks sane.

### Step 3 — Recurrence memory

Before saving the new audit row:
1. Pull the previous 7 audits.
2. For every `failed_check_key` in this run, count how many of the last 7 audits had the same key.
3. If count ≥ 2, mark the issue as **🔁 RECURRING** in the toast/console and in the `notes` field — e.g. *"`stripe_missing` failed today, also failed on 2026-05-03 and 2026-05-02."*
4. If a check that previously failed now passes, log *"✅ `image_missing` resolved (last failed 2026-05-02)."*

### Step 4 — UI improvements

- Toast summary: `Future Ready: 18/20 ✅, 1 ⚠️, 1 🔁 recurring`.
- Detailed results in console + alert modal grouped by section (Cron / History / Today / Future / Library / Stripe / Images).
- Each issue shows: **What**, **Why**, **Fix**, and **Recurrence** (e.g. "first time" or "3rd time in 7 days").
- Keep the existing "WOD Health Check" button untouched — it stays as the quick "today only" check. "Future Ready?" is the deeper weekly-aware audit.

### Step 5 — Auto-run from existing daily audit

The `daily-system-health-audit-after-generation` cron already runs at 14:00 UTC. Have it also write a row into `wod_readiness_audits` so the memory builds even on days you don't click the button manually.

## Technical notes

- Migration: create `wod_readiness_audits` with admin-only RLS (mirror `system_health_audits` policies).
- All checks happen client-side in `WODManager.tsx` against existing tables (`cron_job_metadata`, `wod_generation_runs`, `admin_workouts`, `wod_auto_generation_config`, `workout_of_day_state`, `exercises`). No new edge function needed for the manual button.
- Server-side autosave: extend `daily-system-health-audit-after-generation` (or its target function) to also insert a `wod_readiness_audits` row.
- No changes to generation crons themselves — they're working correctly.

## Files touched

- `src/components/admin/WODManager.tsx` — replace `handleTomorrowReadinessCheck` with `handleFutureReadinessCheck`; rename button.
- New migration — create `wod_readiness_audits` table + RLS.
- `supabase/functions/daily-system-health-audit/index.ts` (or equivalent) — append an insert into the new table.

## Outcome

After this:
- ❌ The false "cron not active" alarm is gone (real job names checked).
- ✅ One button gives you a complete picture: crons, last week's runs, today's integrity, next week's periodization, library readiness, Stripe, images.
- 🔁 Recurring problems get flagged automatically — you'll know "this is the same Stripe failure as yesterday" without remembering it yourself.
