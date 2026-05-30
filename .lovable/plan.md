## Goal

Stop AI ritual generation entirely. Each day, automatically assign one ritual from the existing library of 180 to "today". Random pick, but every ritual must play once per cycle before any repeats. Admin keeps full manual control via the back office.

## What gets removed

1. **Cron job** `generate-daily-ritual-midnight` (id 44, `5 22 * * *`) — `cron.unschedule`.
2. **Edge function** `supabase/functions/generate-daily-ritual/` — deleted from code and from Supabase.
3. **`cron_job_metadata`** row `generate-daily-ritual-job` — marked inactive/deleted.
4. **References** in `CronJobsManager.tsx`, `run-system-health-audit/index.ts`, `portabilityDocContent.ts`, `supabase/config.toml`, and the two docs/mem files that name it.
5. **Memory**: remove/update any rule that implies the AI generates rituals.

## What gets added — rotation system

### New table `daily_ritual_assignments`
```
ritual_date  date primary key
ritual_id    uuid references daily_smarty_rituals(id)
cycle_number int not null
assigned_at  timestamptz default now()
```
GRANT SELECT to anon/authenticated, full to service_role. RLS enabled, public read policy (rituals are already publicly listed in the library; the gate stays at the ritual content level via existing logic). 

### New edge function `assign-daily-ritual`
Logic each run:
1. Compute today (Cyprus tz).
2. If a row for today already exists → exit.
3. Find current `cycle_number` = max in table (or 1 if empty).
4. Pick a ritual whose `id` is NOT yet used in this cycle, `ORDER BY random() LIMIT 1`.
5. If none left → start `cycle_number + 1` and pick from full library.
6. Insert `(today, picked_id, cycle)`.

Idempotent, no AI calls, < 1s.

### New cron job
Same slot as the old one (`5 22 * * *` = 00:05 Cyprus winter), via `supabase--insert`. Registered in `cron_job_metadata` as `assign-daily-ritual-job` so it shows in `CronJobsManager`. Added to `run-system-health-audit` allowlist.

### Backfill today
Run `assign-daily-ritual` once immediately so today already has a pick.

## Read-path changes (frontend + notifications)

The two callers that look up by `ritual_date = today`:
- `src/pages/DailySmartyRitual.tsx` (line 54)
- `supabase/functions/send-morning-notifications/index.ts` (line 251)
- `supabase/functions/send-ritual-notifications/index.ts` (line 88)

Change each from:
```ts
.from("daily_smarty_rituals").eq("ritual_date", todayStr)
```
to:
```ts
.from("daily_ritual_assignments")
  .select("ritual_id, daily_smarty_rituals(*)")
  .eq("ritual_date", todayStr)
```
…and unwrap the joined ritual. No UI / template / placeholder changes — `day_number` still flows through.

## Library decoupling

The library currently uses `ritual_date` as a unique key, which was only meaningful for the old "one per day" model. We keep the column (existing 180 rows already have unique dates), but it is no longer the lookup key — only the new `daily_ritual_assignments` table drives "today's ritual". Admin can edit/delete rituals freely; the next cron run will simply skip deleted ids.

## Risks (all small)

- **send-morning-notifications** also still reads ritual to embed Day-N. Updated identically. Zero behavior change for users.
- **Unique constraint on `ritual_date`** stays — does not block rotation because we no longer insert into the library.
- **Admin delete of a ritual currently in today's assignment** → handled by `ON DELETE CASCADE` so the row vanishes and tomorrow's cron picks a new one. We log a warning if the page loads with no assignment.
- **Time window**: identical cron slot, identical behavior surface for users.

## Files changed

Code: `DailySmartyRitual.tsx`, `send-morning-notifications/index.ts`, `send-ritual-notifications/index.ts`, `CronJobsManager.tsx`, `run-system-health-audit/index.ts`, `portabilityDocContent.ts`, `supabase/config.toml`, `docs/DEVELOPMENT_STANDARDS.md`, `docs/SMARTYWOD_SETUP_GUIDE.md`, `mem/system/workout-generation-rescue-plan.md`.
New: `supabase/functions/assign-daily-ritual/index.ts`.
Deleted: `supabase/functions/generate-daily-ritual/`.
Migrations: create `daily_ritual_assignments` + RLS + grants.
DB ops (via insert tool): unschedule old cron, schedule new cron, deactivate old metadata, insert new metadata, run `assign-daily-ritual` once for today.
Memory: update index + replace any "AI generates rituals" entries with "Rituals are admin-curated; daily pick rotates the library".