# Fix: WOD Name Collision (Kinetic Cascade)

## Root Cause

The duplicate "Kinetic Cascade" entries are not actually duplicates — they are two different workouts that share the same base name:

1. **Today's WOD** — `Kinetic Cascade 0424EQ` (CARDIO / AMRAP / generated 04/24)
2. **Older free workout** — `Kinetic Cascade` (CALORIE BURNING / TABATA / created 04/20)

The WOD generator already has a uniqueness check, but it only queries existing names **within the same category** (`generate-workout-of-day/index.ts`, line 751: `.eq("category", category)`). Today's WOD was generated for `CARDIO`, so the older `CALORIE BURNING` workout with the same name was invisible to the collision check — and the AI happily reused "Kinetic Cascade".

This violates the project's [workout naming uniqueness standard](mem://system/workout-naming-and-uniqueness-standard) which requires unique names across the **entire library**.

## Fix — Two Parts

### Part 1: Rename the Conflicting Free Workout (data fix)

Rename the older free workout so the library has no remaining collision:

- `FREE-calorie-burning-B-1776659161171`
- `Kinetic Cascade` → **`Kinetic Cascade Burn`**

Run a SQL `UPDATE` via the data tool. No regeneration, no Stripe changes (this workout is free and has no Stripe product).

### Part 2: Harden the Generator (code fix)

In `supabase/functions/generate-workout-of-day/index.ts`:

1. **Broaden the existing-names query** (around line 748-753): remove the `.eq("category", category)` filter so the banlist covers **all categories** (WODs, free workouts, premium, standalone — everything in `admin_workouts`). Bump the limit to 2000 to cover the full library.
2. **Keep the post-generation collision auto-rename** (lines 2207-2230) as the second safety net — it already appends a `MMDD+EQ/BW/V` suffix when a collision slips through. With the broader banlist feeding it, it will now also catch cross-category collisions.
3. **Add a final pre-insert guard**: right before inserting the new workout into `admin_workouts`, do one last `select id from admin_workouts where lower(name) = lower(newName) limit 1`. If anything is returned, append the date+equipment suffix again. This protects against race conditions where another row was added between the initial banlist fetch and the insert.

No prompt rewrites, no behavior changes for end users — purely an internal safety net.

## Files Touched

- **Data**: `admin_workouts` row `FREE-calorie-burning-B-1776659161171` (rename only)
- **Code**: `supabase/functions/generate-workout-of-day/index.ts`
  - ~3 lines changed in the existing-names fetch block
  - ~10 lines added for the pre-insert guard

## What the User Will See

- The "Kinetic Cascade" free workout in the Calorie Burning library will now read **"Kinetic Cascade Burn"**.
- Today's WOD `Kinetic Cascade 0424EQ` is unchanged.
- All future WODs will be guaranteed unique across the entire workout library.

## Out of Scope

- No changes to Stripe products, pricing, images, or any UI.
- No changes to existing WODs from prior days.
- No design, layout, or content changes elsewhere.
