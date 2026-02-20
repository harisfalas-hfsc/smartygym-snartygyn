
# Fix: Finisher View Buttons, Stripe Name Sync, and Comprehensive Audit

## Problems Found

### 1. Equipment WOD Finisher - "burpee" Has No View Button
The finisher section content reads: "After each row, immediately perform burpee." The exercise-matching system skips this because:
- The `extractExerciseNames` function filters out text starting with "perform" (line 257 of exercise-matching.ts)
- "burpee" is embedded mid-sentence, not on its own line as a standalone exercise
- The section IS being processed (finisher has `process: true`), but the extraction logic cannot parse "burpee" from that sentence structure

**Fix**: The `main_workout` HTML for the Equipment WOD needs the finisher section's "burpee" replaced with proper `{{exercise:1160:burpee}}` markup via a direct database update. Additionally, improve `extractExerciseNames` to detect exercise names embedded after "perform" verbs.

### 2. Stripe Product Name Not Updated
When the name collision guard renamed the Equipment WOD from "Summit Gauntlet" to "Summit Complex" in the database, it only ran `supabase.update()` -- it never called `stripe.products.update()` to sync the Stripe product name. The Stripe product `prod_U0jYmll4JYuTu4` still shows "Summit Gauntlet".

**Fix**: 
- Update the name collision guard in `generate-workout-of-day/index.ts` to also update the Stripe product name when renaming
- Immediately fix the current Stripe product via the Stripe API

### 3. Bodyweight WOD Finisher - Already Correct
The Bodyweight WOD finisher has proper markup: `{{exercise:v-up:V-Up}}`, `{{exercise:broad-jump:Broad Jump}}`, `{{exercise:3361:skater hops}}`. No action needed.

### 4. Training Programs - All Have Markup
All 20 visible training programs show `HAS_MARKUP` status for their `weekly_schedule` field. No action needed.

## Implementation Plan

### Step 1: Fix Today's Equipment WOD Finisher (Database)
Update the `main_workout` HTML for `WOD-CH-E-1771549202373` to replace "burpee" with `{{exercise:1160:burpee}}` in the finisher section.

### Step 2: Fix Stripe Product Name (Stripe API)
Update Stripe product `prod_U0jYmll4JYuTu4` name from "Summit Gauntlet" to "Summit Complex".

### Step 3: Add Stripe Name Sync to Collision Guard
In `generate-workout-of-day/index.ts`, after the name collision guard renames the workout in the database (around line 2471), add a Stripe product update call:
```
// Also update Stripe product name
const workoutRecord = await supabase.from("admin_workouts")
  .select("stripe_product_id").eq("id", generatedWorkouts[1].id).single();
if (workoutRecord.data?.stripe_product_id) {
  await stripe.products.update(workoutRecord.data.stripe_product_id, { name: newName });
}
```

### Step 4: Improve Exercise Extraction for "perform X" Patterns
In `exercise-matching.ts`, add a new extraction pattern in `extractExerciseNames` that catches "perform [exercise]" patterns. Currently line 257 filters out ALL text starting with "perform". Change this to:
- Still skip generic instructional text like "perform each exercise for 30 seconds"
- But extract the exercise name after "perform" when it matches a known pattern (e.g., "perform burpee" should extract "burpee")

Specifically, in the `<br>`-separated lines handler (Pattern 4), add handling for "perform X" where X is a short exercise candidate.

### Step 5: Run Reprocess on Today's WODs
After the database fix and code deployment, run the `reprocess-wod-exercises` function on both today's WODs to catch any remaining unmatched exercises.

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-workout-of-day/index.ts` | Add Stripe name sync to collision guard |
| `supabase/functions/_shared/exercise-matching.ts` | Handle "perform [exercise]" extraction pattern |
| Database (SQL) | Fix Equipment WOD finisher "burpee" markup |
| Stripe API | Update product `prod_U0jYmll4JYuTu4` name to "Summit Complex" |
