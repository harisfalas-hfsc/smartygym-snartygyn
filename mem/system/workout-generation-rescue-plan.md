---
name: Workout Generation Rescue Plan
description: Standby plan to move WOD cron from 21:05/21:25 UTC to 06:30/06:50 UTC and switch to next-day pre-generation. NOT YET APPROVED — bring back ONLY when user asks.
type: feature
---

# Workout Generation Rescue Plan (STANDBY — not yet approved)

**Status:** User reviewed and parked it on 2026-05-04. Do NOT execute unless the user explicitly says "bring back the rescue plan" or equivalent. Hold for the next 2–3 days while monitoring current 21:05/21:25 UTC behaviour.

## Plain summary
1. Move the two heavy AI WOD jobs from 21:05 / 21:25 UTC (peak global AI traffic) to **06:30 / 06:50 UTC** = 09:30/09:50 Cyprus summer, 08:30/08:50 winter (calmest gateway window).
2. Switch from "generate today's WOD just before midnight" to "every morning, generate **tomorrow's** WODs and store them". At Cyprus midnight the archive job moves today's WODs to galleries and tomorrow's pre-built WODs auto-become "today" via the `generated_for_date` filter. Zero gap, no last-minute AI calls.

## New daily timeline
- 05:00 UTC (07:00 Cyprus) — send-morning-notifications (unchanged, pings users about TODAY's WOD)
- 06:30 UTC (09:30 Cyprus) — generate-wod-bodyweight-daily → builds TOMORROW's bodyweight WOD
- 06:50 UTC (09:50 Cyprus) — generate-wod-equipment-daily → builds TOMORROW's equipment WOD (20-min gap kept)
- 21:00 UTC (00:00 Cyprus) — archive-old-wods (moved from 22:00 UTC)
- 02:00 UTC — backup-wod-generation (unchanged safety net)
- 02:15 UTC — watchdog-wod-check (unchanged safety net)
- 22:05 UTC — generate-daily-ritual (separate system, unchanged)

## Complete file/place changes (every spot that drifts otherwise)
1. **DB migration** — `update-wod-generation-window`:
   - `cron.unschedule` + `cron.schedule` for the 3 jobs to new times.
   - Cron bodies pass `targetDate = (now() AT TIME ZONE 'Europe/Nicosia' + interval '1 day')::date`.
   - `UPDATE wod_auto_generation_config SET generation_hour_utc=6, generation_minute_utc=30`.
   - `UPDATE cron_job_metadata` rows (schedule + schedule_human_readable).
   - Update `update_wod_cron_schedule(hour, minute)` RPC to reschedule BOTH split jobs (bodyweight at chosen time, equipment at chosen+20min) instead of obsolete `generate-workout-of-day`.
2. **Edge fn `generate-workout-of-day`** — already accepts `targetDate`, no change.
3. **Edge fn `archive-old-wods`** — already filters by `generated_for_date < cyprusToday`; only add comment documenting new contract.
4. **Edge fn `run-system-health-audit`**:
   - Line ~137 `cronHourUTC: 22` → `21`.
   - Line ~141 description string updated.
   - Lines ~673 / ~679 fallback `22:30 UTC` → `06:30 UTC`.
   - Add new check: "Tomorrow's WODs pre-generated" by 12:00 UTC.
5. **Edge fns `backup-wod-generation` + `watchdog-wod-check`** — keep behaviour (re-trigger today's date as safety nets).
6. **`src/components/admin/WODManager.tsx`**:
   - Lines 143, 326, 890, 1176, 1193 → fallback `?? 22` → `?? 6`.
   - Line 592 stagger hint `"21:05 and 21:25"` → `"06:30 and 06:50"`.
   - Section A description comment updated.
   - Add "Tomorrow's WOD pre-generated" check (queries `admin_workouts` for `generated_for_date = tomorrow_cyprus AND is_workout_of_day = true`, expects 1 for Recovery / 2 otherwise per periodization).
7. **`src/components/admin/WODAutoGenConfigDialog.tsx`**:
   - Line 35 default `cyprusHour` 0 → 9.
   - Line 64 default `?? 22` → `?? 6`.
   - Help text rewritten to explain morning-for-tomorrow model + automatic midnight rollover.
8. **`src/components/admin/WODSchedulePreview.tsx`** — Line 286 fallback `?? 22` → `?? 6` (display reads from config, auto-updates).
9. **`src/components/admin/CronJobsDocumentation.tsx`** — Line 138 archive row "Daily at 22:00" → "Daily at 21:00 UTC (00:00 Cyprus)"; update WOD generator rows to 06:30 / 06:50 UTC.
10. **`src/components/admin/GenerateWODDialog.tsx`** — Helper copy under "Pre-Generate for Future Date" updated to mention cron now pre-generates tomorrow automatically.
11. **`src/components/admin/CronJobsManager.tsx`** — No code change (reads from `cron_job_metadata`, auto-reflects).
12. **Memory updates**:
    - Update `mem://system/wod-future-ready-audit.md` (new tomorrow check).
    - Update `mem://system/wod-generation-plan-c-d-architecture.md` (new times + next-day model).
    - Update `mem://system/wod-archival-and-categorization-lifecycle.md` (archive at 21:00 UTC, automatic rollover).
    - Add `mem://system/wod-generation-time-window.md` documenting 06:30/06:50 UTC choice and rationale (global AI traffic).
    - Add Core rule: "WOD generation runs 06:30/06:50 UTC for next-day; archive 21:00 UTC. Do not move without weighing global AI gateway load."

## What stays exactly the same
Manual "Generate New WOD" button & dialog • morning notifications at 07:00 Cyprus • backup/watchdog 02:00/02:15 UTC • 84-day periodization • library-first selection • Stripe creation • image generation • all-or-nothing publishing • density validation • naming uniqueness • daily ritual at 22:05 UTC • all check-in/renewal/weekly/holiday notifications.

## Order of execution
1. Migration: update `update_wod_cron_schedule` RPC.
2. Migration: reschedule 3 cron jobs + sync `cron_job_metadata` + `wod_auto_generation_config` in one transaction.
3. Edge function edits (run-system-health-audit, archive-old-wods comment).
4. Frontend edits (WODManager, WODAutoGenConfigDialog, WODSchedulePreview, CronJobsDocumentation, GenerateWODDialog).
5. Memory updates.
6. Verify: open Future Ready? (all green, new times shown), Cron Jobs page (new times), then click Generate New WOD → Today once to confirm engine still healthy.

## Risks & mitigations
- Switchover day: today's WOD already exists, no user gap; new 06:30 UTC job builds tomorrow's the next morning.
- DST: schedules in UTC are stable; human strings note both summer/winter Cyprus times.
- Morning failure: backup at 02:00 UTC the next night re-tries, watchdog at 02:15 UTC alerts admin, manual button always available.
