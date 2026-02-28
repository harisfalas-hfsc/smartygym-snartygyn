

# Fix: Hide Broken Workout and Prevent Future Visibility of Malformed Content

## The Problem

"Foundation Builder Core" (WOD-S-B-1772231407202) was "archived" by simply clearing `is_workout_of_day`, but it was left with `is_visible=true` and an active Stripe product. It's sitting in the gallery right now with only Main Workout + Finisher sections (missing Soft Tissue, Activation, and Cool Down). Anyone browsing the Strength category can see it and potentially buy it.

No purchases exist for it. One view interaction (yours).

## What Will Be Done

### Step 1: Hide the broken workout immediately
- Set `is_visible=false` on "Foundation Builder Core" (WOD-S-B-1772231407202) so it disappears from all user-facing pages
- This is a data update, not a code change

### Step 2: Fix the archival logic so this never happens again
In **`supabase/functions/archive-old-wods/index.ts`** and **`supabase/functions/generate-workout-of-day/index.ts`**:
- When a WOD fails section validation and gets replaced, set `is_visible=false` on the broken record (not just clear the WOD flag)
- Malformed workouts must never be left visible in the gallery

In **`supabase/functions/_shared/section-validator.ts`** (already exists from previous fix):
- Already validates the 5 required sections -- no changes needed here

### Step 3: Update the orchestrator's retry/replace logic
In **`supabase/functions/wod-generation-orchestrator/index.ts`**:
- When `retryMissing` archives an incomplete WOD, set `is_visible=false` on that record
- This ensures any future malformed WOD that gets caught and replaced is hidden, not dumped into the gallery

## What Will NOT Change
- No UI changes
- No prompt changes
- No new files
- The replacement workout "Foundation Builder Forge" stays as-is (it's complete and correct)

## Files to update
- `supabase/functions/generate-workout-of-day/index.ts` (hide broken WODs on replace)
- `supabase/functions/wod-generation-orchestrator/index.ts` (hide on retry/replace)
- Database: one UPDATE query to hide the current broken workout

