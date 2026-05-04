# Plan — Forced STRENGTH/Advanced WOD Test Run

## Goal

Run the **real** WOD generation pipeline (AI generation, exercise linking, normalization, image, Stripe) for a **STRENGTH / Advanced** workout, on demand, **without**:

- replacing today's published WOD,
- sending notifications,
- being shown to users on the homepage WOD widget,
- breaking the 84-day periodization for upcoming days.

The result is a fully-formed workout we can open in admin, inspect end-to-end, and confirm the previous failure mode is fixed.

## Approach

Add a `testMode` execution path to `generate-workout-of-day` that:

1. Takes explicit `forceCategory` + `forceDifficultyStars` (e.g. `STRENGTH`, `5`).
2. Runs the same generation, linking, normalization, image-generation and Stripe steps as production.
3. Saves the workout to `admin_workouts` but with:
   - `is_workout_of_day = false`
   - `generated_for_date = null`
   - `is_visible = true` (so it shows up in the matching category gallery for review)
   - `name` prefixed with `[TEST]`
   - `wod_source = 'test_mode'`
4. **Skips** notifications, homepage announcement, daily-slot contract, and rollback-of-active-WOD logic.
5. Still runs the publish contract (`validateWodPublishContract`) in **structural** mode so we get the same quality gating.

Then add an admin dialog to trigger it and link to the result.

## Changes

### 1. `supabase/functions/generate-workout-of-day/index.ts`

- Extend `runWodGeneration` params with:
  ```ts
  testMode?: boolean;
  forceCategory?: string;          // e.g. "STRENGTH"
  forceDifficultyStars?: number;   // 1..6
  forceEquipment?: 'BODYWEIGHT' | 'EQUIPMENT' | 'VARIOUS';
  forceFormat?: string;            // optional, defaults from FORMATS_BY_CATEGORY
  ```
- HTTP entry (`serve(...)` ~line 3277): parse `testMode`, `forceCategory`, `forceDifficultyStars`, `forceEquipment`, `forceFormat` from body and pass through.
- When `testMode === true`:
  - Skip the "existingWODsForDate" branching (do not consult or modify today's published WODs).
  - Override the periodization-derived `category` and `selectedDifficulty` with the forced values (analogous to existing `forcedParameters` path, but coming from the request, not a retry).
  - Restrict `equipmentTypesToGenerate` to `[forceEquipment]` (default `EQUIPMENT` for STRENGTH/Advanced — most representative of the prior failure).
  - At save time:
    - `is_workout_of_day = false`
    - `generated_for_date = null`
    - `wod_source = 'test_mode'`
    - prefix `name` with `"[TEST] "`
  - Skip the notification / homepage announcement send.
  - Skip rollback-of-active-WOD on failure (only delete the test row itself).
- Run `validateWodPublishContract` in `mode: 'structural'`, but treat failures as "test failed" rather than "rollback today's WOD".
- Return JSON with `{ ok, workoutId, name, failures, warnings }`.

### 2. `supabase/functions/wod-generation-orchestrator/index.ts`

- Accept and pass through `testMode` and the force-* params when calling `generate-workout-of-day`.
- When `testMode`, skip the day-level slot completeness check (`validateDayPublishContract`) at the end — orchestrator returns whatever the generator returned.

### 3. New admin UI: `src/components/admin/TestGenerateWODDialog.tsx`

A small dialog with:

- Category select (default `STRENGTH`).
- Difficulty stars select (default `5` = Advanced).
- Equipment select (`EQUIPMENT` / `BODYWEIGHT` / `VARIOUS`, default `EQUIPMENT`).
- Format select (auto-filled from `FORMATS_BY_CATEGORY[category]`, default first; for STRENGTH this is `REPS & SETS`).
- "Run Test Generation" button → calls `supabase.functions.invoke('wod-generation-orchestrator', { body: { testMode: true, forceCategory, forceDifficultyStars, forceEquipment, forceFormat, background: false } })`.
- On success: show resulting workout name + a link `/admin/workouts/:id` (or whatever the existing admin workout edit route is).
- Shows the validation `failures` and `warnings` if any.

### 4. Admin entry point

In the existing **Admin → WOD Manager** screen (next to the existing `GenerateWODDialog`), add a secondary button **"Test generation (no publish)"** that opens `TestGenerateWODDialog`.

### 5. Cleanup helper

Add a small admin action **"Delete all `[TEST]` workouts"** in the same WOD Manager section:

- Lists workouts where `name LIKE '[TEST]%'` AND `wod_source = 'test_mode'`.
- Soft-deletes them (`is_visible = false`) consistent with the project's non-destructive content policy. (Hard delete is not used because of the existing archival/no-permanent-delete rule.)

## What this proves

A successful run with `STRENGTH` + Advanced (5★) + `EQUIPMENT` exercises the exact pipeline path that previously failed:

- Strength format pinned to `REPS & SETS` (enforced by trigger + format guard).
- Section validator + density check on `main_workout`.
- Library-first exercise matching with required exercise count.
- Image generation + Stripe product creation (background tasks).
- Public name guard (no internal codes, no AI-style words).

If the `[TEST]` workout lands with `ok: true` and renders cleanly in the admin, we have direct evidence that the previous STRENGTH/Advanced failure mode is fixed — without affecting today's user-facing WOD.

## Out of scope

- Any change to the cron schedule.
- Any change to the periodization tables.
- Any change to user-facing pages or notifications.

