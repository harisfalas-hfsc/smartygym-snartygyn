# Workout Generation Rescue Plan — Final Synchronized Version

## Goal in plain English
Move the two heavy AI workout-generation jobs away from the busy evening AI traffic window (21:05/21:25 UTC) into the calmest global window (**06:30 / 06:50 UTC** = 09:30/09:50 Cyprus summer, 08:30/08:50 winter), and switch from "make today's WODs at the last minute" to "every morning, make **tomorrow's** WODs". At Cyprus midnight today's WODs are archived and tomorrow's pre-built WODs automatically become "today" — zero gap, zero last-minute AI calls.

## New daily timeline (everything synchronized)

```text
05:00 UTC  07:00 Cyprus   send-morning-notifications  (uses TODAY's already-built WOD)  ← unchanged
06:30 UTC  09:30 Cyprus   generate-wod-bodyweight-daily  → builds TOMORROW's bodyweight WOD
06:50 UTC  09:50 Cyprus   generate-wod-equipment-daily   → builds TOMORROW's equipment WOD
14:00 UTC  17:00 Cyprus   daily-system-health-audit     ← unchanged (now audits 7h after gen)
21:00 UTC  00:00 Cyprus   archive-old-wods              ← MOVED from 22:00 UTC
22:05 UTC  01:05 Cyprus   generate-daily-ritual         ← unchanged (separate system)
02:00 UTC  05:00 Cyprus   backup-wod-generation         ← unchanged safety net
02:15 UTC  05:15 Cyprus   watchdog-wod-check            ← unchanged safety net
```

All other crons (renewal reminders 09:00 UTC, weekly motivation, blog, check-ins, reengagement, welcome onboarding, Stripe cleanup, SEO refresh, etc.) **stay exactly where they are**.

## What gets touched, place by place

### 1. Database — single migration, atomic
- Reschedule **3 cron jobs** via `cron.unschedule` + `cron.schedule`:
  - `generate-wod-bodyweight-daily` → `30 6 * * *`, body now passes `targetDate` = tomorrow Cyprus.
  - `generate-wod-equipment-daily` → `50 6 * * *`, body now passes `targetDate` = tomorrow Cyprus.
  - `archive-old-wods` → `0 21 * * *` (was `0 22 * * *`).
- Update `cron_job_metadata` rows for those 3 jobs (`schedule`, `schedule_human_readable`, `request_body`).
- Update `wod_auto_generation_config`: `generation_hour_utc = 6`, `generation_minute_utc = 30`.
- Rewrite both overloads of `update_wod_cron_schedule(...)` RPC so the admin UI's time picker controls **both split jobs** (bodyweight at chosen H:M, equipment at chosen H:M+20). The current RPC still references the obsolete `generate-workout-of-day` job and would silently no-op.

### 2. Edge functions
- **`wod-generation-orchestrator/index.ts`**: read optional `targetDate` from request body; if present and valid, use it as `effectiveDate` (otherwise fall back to today Cyprus). One-line change in the body-parser block + one assignment. This is required because the cron job is the only thing passing `targetDate`.
- **`run-system-health-audit/index.ts`**:
  - Line 137: `cronHourUTC: 22` → `21` (archive job).
  - Line 141 description: "22:00 UTC (00:00 Cyprus)" → "21:00 UTC (00:00 Cyprus)".
  - Line 147: keep `cronHourUTC: wodHour` (auto-reads from config = now 6).
  - Line 148: `cronMinuteUTC: 30`. Document that gen now produces TOMORROW's WOD.
  - Lines 673, 679 fallback strings `?? 22` → `?? 6`.
  - Add new check in `validateWodPipelineHealth`: "Tomorrow's WODs pre-generated" — queries `admin_workouts` for `generated_for_date = tomorrowCyprus AND is_workout_of_day = true`, expects 1 (recovery day) or 2 (normal). Runs only when current Cyprus time ≥ 12:00 (gives morning gen + retries time to finish).
- **`archive-old-wods/index.ts`**: comment-only update describing new midnight rollover contract (logic unchanged — still filters `generated_for_date < cyprusToday`).
- **`backup-wod-generation` + `watchdog-wod-check`**: unchanged. Still verify TODAY's WODs at 02:00/02:15 UTC; if missing they alert and call orchestrator in `verify`/`generate` mode for today as a safety net.

### 3. Admin UI — every screen you mentioned
- **`src/components/admin/WODManager.tsx`** (the "Future Ready?" / WOD section):
  - Lines 143, 326, 890, 1176, 1193: fallback `?? 22` → `?? 6`.
  - Line 592 stagger hint `"21:05 and 21:25"` → `"06:30 and 06:50"`.
  - Add a "Tomorrow's WOD pre-generated ✅/❌" tile in the Future Ready audit, sourced from the new audit check.
  - Update Section A description to say "auto-generates tomorrow's WODs every morning at 09:30/09:50 Cyprus".
- **`src/components/admin/WODAutoGenConfigDialog.tsx`** (Schedule dialog):
  - Line 35 default `cyprusHour` 0 → 9.
  - Line 64 default `?? 22` → `?? 6`.
  - Help text rewritten: "WODs are pre-built every morning for the next day. The selected time controls when both bodyweight (chosen time) and equipment (chosen +20 min) jobs run."
- **`src/components/admin/WODSchedulePreview.tsx`** Line 286: fallback `?? 22` → `?? 6` (the rest reads from config and auto-updates).
- **`src/components/admin/CronJobsDocumentation.tsx`** (the brochure page at `/brochure/cron-jobs`):
  - Update WOD generator rows to `06:30 UTC` and `06:50 UTC`.
  - Update archive row "Daily at 22:00" → "Daily at 21:00 UTC (00:00 Cyprus)".
- **`src/components/admin/GenerateWODDialog.tsx`** (manual "Generate New WOD" button): helper copy under "Pre-Generate for Future Date" updated to mention cron now pre-generates tomorrow automatically — manual generation is for filling specific dates further out.
- **`src/components/admin/CronJobsManager.tsx`**: NO code change. It reads everything from `cron_job_metadata`, so once the migration runs the admin Cron Jobs panel (Content Generation / Notifications / Maintenance tabs) shows the new times automatically.
- **`src/components/admin/CronTimeConfigDialog.tsx`** (legacy quick-time picker): default `currentHour` 5 → 6; pass minute=30 to the rewritten RPC.
- **`src/components/admin/AutomatedSchedulingManager.tsx`**: NO change — only manages renewal/re-engagement messages, not WODs.
- **`src/components/admin/SettingsManager.tsx`**: NO functional change — only invokes `archive-old-wods` manually; still works.

### 4. What is NOT touched (verified safe)
- Auto messages, automation rules, email/dashboard notifications, push notifications, renewal reminders, weekly reports, welcome sequence, holiday notifications, daily ritual, blog generation — all run on independent crons unrelated to WOD timing.
- New-content notifications (`pending_content_notifications`) explicitly **exclude WODs** in the trigger (`queue_workout_notification`), so generating WODs in the morning won't spam users at 9:30am.
- `send-morning-notifications-job` at 05:00 UTC keeps notifying users at 7am Cyprus about today's WOD (which was pre-built yesterday morning).
- Stripe sync, image sync, image-repair jobs, orphan cleanup — untouched.
- 84-day periodization, library-first selection, density validation, naming uniqueness, Stripe attachment, image generation, all-or-none publishing — all untouched.

### 5. Memory updates
- Update `mem://system/wod-future-ready-audit.md` (new tomorrow check).
- Update `mem://system/wod-generation-plan-c-d-architecture.md` (new times + next-day model).
- Update `mem://system/wod-archival-and-categorization-lifecycle.md` (archive at 21:00 UTC, automatic rollover).
- Add `mem://system/wod-generation-time-window.md` documenting 06:30/06:50 UTC choice and rationale.
- Add Core rule: "WOD generation runs 06:30/06:50 UTC for next-day; archive 21:00 UTC."
- Mark `mem://system/workout-generation-rescue-plan.md` as **APPROVED & EXECUTED** with date.

## Order of execution (zero-conflict)
1. Migration 1: rewrite `update_wod_cron_schedule` RPC (both overloads).
2. Migration 2 (single transaction): unschedule + reschedule 3 cron jobs, sync `cron_job_metadata` and `wod_auto_generation_config`.
3. Edge function edits (`wod-generation-orchestrator`, `run-system-health-audit`, `archive-old-wods` comment) — auto-deploy.
4. Frontend edits.
5. Memory updates.
6. Verify checklist:
   - Admin → Cron Jobs panel shows new times in all 3 tabs.
   - Admin → WOD Manager → "Future Ready?" runs all green and includes the new "Tomorrow ready" check.
   - Admin → WOD Manager → "Schedule" dialog shows 09:30 Cyprus default.
   - `/brochure/cron-jobs` shows updated times.
   - Click "Generate New WOD → Tomorrow" once to confirm engine still produces a valid WOD with `generated_for_date = tomorrow`.

## Risks & mitigations
- **Switchover day**: today's WOD (built tonight at the OLD 21:05 UTC) is already in place when migration runs. The new 06:30 UTC job tomorrow morning then builds the day-after's WODs. There is **never a missing-WOD window**.
- **Morning gen failure**: backup at 02:00 UTC the next night re-tries today's WOD as a safety net, watchdog at 02:15 UTC alerts admin, and the manual "Generate New WOD" button is always available.
- **DST**: cron schedules are in UTC and stable year-round; human-readable strings explicitly note both summer/winter Cyprus times.
- **AI gateway still slow**: 06:30 UTC is statistically the global low-traffic window; if a specific morning still fails, the existing 3-attempt retry + 45s backoff + library-first fallback prevent gaps.

## Approve to proceed
Reply "approve the rescue plan" (or equivalent) and I will execute steps 1→6 in order in the next loop.
