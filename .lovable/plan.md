# Fix sort bug + verify the 10 new free workouts

## Part A — Fix the "Newest First" sort (root cause)

The DB function `get_visible_workout_metadata` does NOT return `created_at`, so the client sort always sees `null` and falls back to `0`. That's why "Glute Core Anchor" appears above "Axial Forge" / "Axial Press" even though those two are genuinely the newest in the database.

Steps:
1. Migration: update `public.get_visible_workout_metadata` to also return `created_at` and `updated_at` (append columns, keep existing ones in the same order so nothing else breaks).
2. Update the matching TypeScript type used by `fetchVisibleWorkoutMetadata` so `created_at` flows through to the list.
3. Sanity-check on `/workout` Strength tab: Axial Forge + Axial Press should appear at the top under "Newest First". Spot-check the same for Cardio, Metabolic, Calorie Burning, and Mobility & Stability tabs.

(No change to the sort code itself — it's already correct, it just had no data to sort on.)

## Part B — Full per-workout QA of the 10 new free workouts

For each of the 10 workouts (5 categories × Bodyweight + Equipment), open `main_workout`, `description`, `tips`, `instructions` and verify:

1. Strict 5-section structure present and wrapped in `workout-content`:
   - Soft Tissue Preparation
   - Activation
   - Main Workout
   - Finisher
   - Cool Down
2. Exercise density meets the minimum per section (per the workout density rule).
3. Every exercise uses `{{exercise:ID:Name}}` library-first markup — no invented exercises, no plain-text exercise names.
4. Every exercise line has reps / sets / tempo / rest prescribed.
5. Category-specific format applied:
   - Strength + Mobility & Stability → REPS & SETS
   - Cardio / Metabolic / Calorie Burning → EMOM / AMRAP / Tabata / Circuit (rotated, not all the same)
6. Bodyweight variants contain zero machine/equipment exercises; Equipment variants use studio/standard equipment only (and Tabata/HIIT respects the no-machine rule).
7. Unique name (no duplicates anywhere in `admin_workouts`) and unique AI-generated `image_url` that actually loads.
8. Free-access flags: `is_free=true`, `is_premium=false`, `is_visible=true`, `stripe_product_id` and `stripe_price_id` both NULL, `is_standalone_purchase=false`.
9. Tone/brand: human-designed voice, no "AI coach" phrasing, aligned with the Smarty Method philosophy.

## Part C — Remediation

For any workout that fails one or more checks in Part B:
- Re-run the single-workout regeneration (not the full batch) preserving the same id, name, image, and free flags, with the failing section as the focus of the fix.
- Re-verify, then report a final pass/fail table for all 10.

## Deliverable

- One migration (RPC return signature) + one type update for Part A.
- A short table for Part B listing each workout id, name, and pass/fail per check, plus what was fixed in Part C.
- No Stripe products created. No structural UI changes. No change to other categories' data.
