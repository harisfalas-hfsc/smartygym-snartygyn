## Goal

Make the Smarty Ritual admin section behave **exactly like Workout of the Day**:

1. See the next 7 days of upcoming rituals (date, day #, content preview).
2. Swap any day's ritual for a different one from the 180-ritual library.
3. Re-roll a random pick for any day.
4. **Users see no change.** Emails, push, web, and the daily ritual page all keep loading "today's ritual" via the same `daily_ritual_assignments` join we already deployed. Nothing in the notification copy, schedule, or behavior changes.

## Confirming your first question

Yes — users will never notice. The reader page (`DailySmartyRitual.tsx`), `send-morning-notifications`, and `send-ritual-notifications` already read from `daily_ritual_assignments` joined to `daily_smarty_rituals`. As long as today's row exists in `daily_ritual_assignments`, the user sees a normal daily ritual exactly like before. The cycle/rotation/admin overrides all live on the admin side only.

## What changes (admin only)

### 1. Pre-assign 7 days ahead (instead of just today)

Today, `assign-daily-ritual` only fills today's date. To preview the next 7 days like WOD does, we extend it to loop through dates `today … today+7` and insert any missing assignment. Same random-from-unused-in-cycle logic; cycle still resets when all 180 are used.

- Idempotent: existing rows are skipped.
- Cron stays at `5 22 * * *` (00:05 Cyprus). Each run keeps the 7-day window full.
- One-time backfill: run the updated function once after deploy so the preview is populated immediately.

### 2. New component: `RitualSchedulePreview.tsx`

Mirrors `WODSchedulePreview.tsx` visually and structurally. Lists the next 7 days, each row showing:

- Date (e.g. `Mon, Jun 2`)
- `Day X/180` badge (the ritual's `day_number`)
- `Cycle N` badge + `Override` badge if swapped
- Short preview of morning / midday / evening content
- Buttons: **Swap Ritual** (opens picker) and **Re-roll Random**

### 3. Swap dialog

Opens a searchable list of all 180 library rituals (search by day #, date, or content — same logic already in `RitualsManager`). Picking one updates that date's `daily_ritual_assignments.ritual_id`. The chosen ritual is then treated as "used" in the current cycle for that date; the previously assigned ritual is freed up to be picked again later in the cycle.

### 4. Re-roll button

Calls `assign-daily-ritual` with `{ date, force: true }` — deletes that date's row and re-inserts a fresh random pick from the unused pool.

### 5. New status widget in `RitualsManager` header

Mirrors `WODManager` header layout:

- **Today's Ritual** card — shows current assignment + link to `/daily-smarty-ritual`
- **Tomorrow's Ritual** card — shows tomorrow's pre-assigned pick
- **Cycle Progress** card — `Cycle N • X/180 used • Y remaining`
- Buttons: `Ritual Health Check` (does today have an assignment? does the library still have rituals?), `Tomorrow's Ritual Preview` (opens a dialog with full content), `Refresh Schedule` (calls `assign-daily-ritual` to top up the 7-day window)

The existing rituals table (create / edit / delete / duplicate / bulk-delete) stays untouched below the new header + schedule preview.

## Technical details

**Edge function `assign-daily-ritual` — extend:**
- Accept optional body `{ date?: string, force?: boolean }`.
- Default: loop dates `today … today+7`, insert any missing assignment.
- `force=true` + `date`: delete that date's row, re-pick.
- Cycle logic unchanged: pick from `library_ids − used_in_current_cycle`; bump cycle when pool empty.

**Edge function call for swap:** done client-side with a direct `update` on `daily_ritual_assignments` (RLS already allows admin). No new function needed.

**Schedule preview query:**
```ts
supabase
  .from("daily_ritual_assignments")
  .select("ritual_date, cycle_number, ritual_id, daily_smarty_rituals(*)")
  .gte("ritual_date", today)
  .lte("ritual_date", today+7)
  .order("ritual_date")
```

**Files touched:**
- `supabase/functions/assign-daily-ritual/index.ts` — add 7-day loop + `force` + `date` params
- `src/components/admin/RitualSchedulePreview.tsx` — new
- `src/components/admin/RitualSwapDialog.tsx` — new (picker)
- `src/components/admin/TomorrowRitualPreviewDialog.tsx` — new (mirrors `TomorrowWODPreviewDialog`)
- `src/components/admin/RitualsManager.tsx` — add header widgets + buttons + mount `<RitualSchedulePreview />` above the existing table
- One-time run of `assign-daily-ritual` after deploy to backfill the next 7 days

**No DB schema changes.** `daily_ritual_assignments` already has everything we need (`ritual_date`, `ritual_id`, `cycle_number`).

**No changes to:** `DailySmartyRitual.tsx`, `send-morning-notifications`, `send-ritual-notifications`, cron schedule, notification copy, or any user-facing surface.

## Risk

Minimal. The reader path is unchanged. The cycle accounting tolerates manual swaps because cycle membership is derived from `daily_ritual_assignments` rows — swapping just changes which `ritual_id` is recorded for that date.
