# Remove WOD AI Generation — Library Mode Only

Permanently remove all AI WOD generation. The daily WOD becomes 100% library‑driven: each day the system picks an existing published workout that matches the 84‑day periodization (category + difficulty + equipment), promotes it to Workout of the Day, fires emails/notifications, and rolls it off at midnight Cyprus — no AI, no credits, no orchestrator.

## What stays (untouched)

- 84‑day periodization engine and "View Periodization" admin view.
- Library‑mode selection (`select-wod-from-library`) — becomes the only path.
- Daily archive/rollover at 21:00 UTC (`archive-old-wods`) — needed so today's WOD clears at Cyprus midnight and tomorrow's pre‑picked one takes over.
- Morning email + push notifications (`send-morning-notifications` etc.) — they only care that a row exists with `is_workout_of_day = true` for today; they keep working unchanged.
- Auto image generation + Stripe linking **for published workouts in the library** (`auto-generate-workout-image`, `wod-stripe-link`) — still used when admin publishes new workouts.
- Periodization preview, WOD history table, WOD status widget, edit workout dialog.

## What gets deleted

### Admin UI (WODManager + related)

Remove these buttons / dialogs from `src/components/admin/WODManager.tsx`:

- "Generate New WOD" button + `GenerateWODDialog`
- "Sync Stripe Images" button (`handleSyncStripeImages`)
- "Archive Current WODs" button (`handleArchiveCurrentWODs`) — daily cron still archives automatically
- "Schedule" / generation‑time config button + `WODAutoGenConfigDialog` (AI run window no longer exists)
- "Library Mode" toggle row (always on, no toggle needed)
- Schedule‑out‑of‑sync warning banner (no AI cron to compare against)
- "Generate" action on individual history rows

Delete component files:
- `src/components/admin/GenerateWODDialog.tsx`
- `src/components/admin/WODAutoGenConfigDialog.tsx`

### Edge functions (delete entirely + un‑deploy)

- `generate-workout-of-day`
- `wod-generation-orchestrator`
- `reprocess-wod-exercises`
- `cleanup-stripe-wod-names`
- `cleanup-wod-stripe-orphans` (orphan sweep only existed because AI runs failed mid‑flight)
- `wod-payment-health-report` (AI‑run payment audit)
- `backup-wod-generation` (just calls the orchestrator)

### Edge functions (refit, do not delete)

- `watchdog-wod-check` → stop calling orchestrator. New job: if today's two WOD slots aren't filled at run time, call `select-wod-from-library` to fill them; if the library has no eligible match, email the admin.
- `verify-wod-rollover` → already library‑agnostic; keep, just verify pre‑picked rows exist.
- `archive-old-wods` → already handles `wod_source = 'library'` correctly; keep, remove any AI‑specific branches.

### Cron jobs to drop (via migration that calls `cron.unschedule`)

- `generate-wod-bodyweight-daily` (06:30 UTC)
- `generate-wod-equipment-daily` (06:50 UTC)
- `wod-retry-pass-1` … `wod-retry-pass-4`
- `wod-post-generation-audit`
- `backup-wod-generation` (02:00 UTC)
- `cleanup-wod-stripe-orphans` (if scheduled)
- `wod-payment-health-report` (if scheduled)

### Cron jobs to add (replace AI generators)

Two new jobs that call `select-wod-from-library` to pre‑pick **tomorrow's** WODs from the library according to the periodization rules:

- `select-wod-bodyweight-daily` — 06:30 UTC, slot = `BODYWEIGHT`
- `select-wod-equipment-daily` — 06:50 UTC, slot = `EQUIPMENT`

### Cron jobs to keep

- `archive-old-wods` (21:00 UTC)
- `watchdog-wod-check` (refit version, 02:15 UTC)
- `send-morning-notifications` (05:00 UTC)
- All non‑WOD jobs untouched.

## Health system check rewrite

`handleHealthCheck` ("Future Ready?"), `handleFutureReadinessCheck`, and `handleRunWatchdog` in `WODManager.tsx`, plus `run-system-health-audit` and `wod-future-ready-audit` logic, currently check that AI generation succeeded. Rewrite the checks to:

1. Today: both WOD rows exist with `is_workout_of_day = true`, `wod_source = 'library'`, `generated_for_date = cyprus_today`, valid image_url + Stripe IDs.
2. Tomorrow + next 7 days: for each day in the periodization plan, at least one published library workout matches the required category/difficulty/equipment so the picker has something to choose.
3. Cron section: the two new `select-wod-*-daily` jobs ran in the last 24h.
4. Library inventory: minimum thresholds per category/difficulty bucket (warn if any bucket is empty).

Drop all checks that reference the removed AI cron jobs and orphan sweepers.

## Database

- Single migration that:
  - Calls `cron.unschedule(...)` for every removed job.
  - Schedules the two new `select-wod-*-daily` jobs via `cron.schedule`.
  - Drops `wod_auto_generation_config` columns that only governed AI (generation hour/minute, retry counts) — keep the row + any columns the library picker uses, or drop the table if unused after refit.
  - Drops `wod_generation_runs` and `wod_generation_notifications` tables (AI orchestrator bookkeeping).

- Existing WOD rows in `admin_workouts` are left alone.

## Content Library "Library Mode" button

Remove the "Library Mode" toggle/button from `src/components/admin/WorkoutsManager.tsx` (and any related state) — library mode is the only mode, the affordance is meaningless.

## Files touched (summary)

Delete:
- `supabase/functions/generate-workout-of-day/`
- `supabase/functions/wod-generation-orchestrator/`
- `supabase/functions/reprocess-wod-exercises/`
- `supabase/functions/cleanup-stripe-wod-names/`
- `supabase/functions/cleanup-wod-stripe-orphans/`
- `supabase/functions/wod-payment-health-report/`
- `supabase/functions/backup-wod-generation/`
- `src/components/admin/GenerateWODDialog.tsx`
- `src/components/admin/WODAutoGenConfigDialog.tsx`

Refit:
- `supabase/functions/watchdog-wod-check/index.ts`
- `supabase/functions/archive-old-wods/index.ts` (light cleanup)
- `supabase/functions/run-system-health-audit/index.ts` (library‑mode checks)
- `src/components/admin/WODManager.tsx` (strip buttons, rewrite health checks)
- `src/components/admin/WorkoutsManager.tsx` (remove Library Mode button)
- `src/components/admin/CronJobsManager.tsx` + `CronJobsDocumentation.tsx` (update job catalogue)
- `src/components/admin/SystemHealthAudit.tsx` (library‑mode wording)
- Memory files: `mem/system/wod-generation-time-window.md`, `mem/system/wod-future-ready-audit.md`, related WOD docs — replaced with a single "library‑only" rule.

Migrations:
- New timestamped migration to unschedule old jobs, schedule new picker jobs, drop dead tables.

## Verification after build

1. Today's two WOD rows still load on the public WOD page.
2. Admin WODManager opens without errors; only library‑mode buttons remain.
3. Manually invoke `select-wod-from-library` for tomorrow's date → row appears.
4. Manually invoke refitted `watchdog-wod-check` → fills missing slot or emails admin.
5. Refitted health check returns all green when library has matching workouts; red when a bucket is empty.
6. Morning notification cron continues to fire (no code change needed).

## Risks / call‑outs

- If the library has zero published workouts matching a given day's periodization slot, the day will have no WOD until admin publishes one. Health check + watchdog email cover this, but it is a real operational constraint to acknowledge.
- `wod_auto_generation_config` may be referenced by other code (notifications, dialogs). The migration drops only AI‑specific columns; the table itself stays if anything else reads from it.
# WOD reliability and cleanup repair

## What is wrong right now

- The backend is healthy. The failure is inside the WOD generation pipeline.
- The manual generation created one staged WOD row: **Loaded Movement Flow**.
- That row is now hidden (`is_visible = false`) and not a current WOD (`is_workout_of_day = false`), so the public View page returns **Workout not found**.
- The Stripe product still exists because the database row still contains `stripe_product_id`, so the orphan cleanup correctly treats it as “linked” and keeps it active.
- The equipment WOD failed because the quality gate rejected the AI output: the finisher was labeled **FOR TIME** but had no rounds/time cap/ladder.
- The admin “Delete” button is intentionally archiving paid/Stripe-linked workouts instead of deleting them, but that behavior is wrong for failed hidden WODs because it leaves unusable hidden rows and active Stripe products.

## Fixes to implement

### 1. Failed hidden WOD cleanup
Create a safe admin cleanup path for failed hidden WODs:

- If a workout is hidden, starts with `WOD-`, has no purchases, and is not an active WOD:
  - archive/deactivate the Stripe product
  - clear Stripe IDs or permanently remove the failed row
  - show a clear success message
- Keep the non-destructive rule for real paid content with customer purchases.

### 2. Admin UI clarity
Update the workout manager so the actions are not misleading:

- Hidden failed WODs show **Delete failed WOD** instead of silently “Archive to Gallery”.
- Archived WODs remain visible in the admin list via the existing WOD/source and hidden filters.
- The View button should not open the public page for hidden WODs; it should either be disabled or open the admin edit view.

### 3. Stripe cleanup correctness
Adjust WOD Stripe cleanup so failed hidden WODs do not keep Stripe products alive forever:

- Treat hidden, non-current, no-purchase WOD rows as cleanup candidates.
- Deactivate their Stripe products during cleanup.
- Preserve active/purchased products safely.

### 4. Generation reliability fix
Fix the generator/quality-gate mismatch that caused today’s repeated failures:

- Strength, Mobility, and Pilates WODs must stay **REPS & SETS** for both Main and Finisher.
- The repair logic must not rewrite a Strength finisher into **FOR TIME**.
- If the quality gate rejects an output, store the exact rejection reason in the run log so the admin panel shows the real cause, not just “missing”.

## What I will not do

- I will not generate a new Workout of the Day during this fix.
- I will not delete purchased customer content.
- I will not touch HFSC-related assets or data.

## Verification

- Confirm **Loaded Movement Flow** can be cleaned without leaving an active Stripe product.
- Confirm hidden failed WODs no longer open to a public 404.
- Confirm future failed generations record the exact quality-gate or upstream error.
- Confirm normal paid workouts with purchases are still protected from permanent deletion.
