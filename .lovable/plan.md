# Plan — 12 Premium Workouts (Calorie Burning + Metabolic + Cardio)

## Goal
Create exactly 12 new premium workouts, mirroring the 24-Strength batch process:
- 3 categories: **CALORIE BURNING**, **METABOLIC**, **CARDIO**
- For each category: 1 BODYWEIGHT + 1 EQUIPMENT at **Intermediate**, and 1 BODYWEIGHT + 1 EQUIPMENT at **Advanced**
- Total = 3 × 4 = **12 workouts**

## Difficulty stars (same matrix as Strength batch)
- **Advanced** → BODYWEIGHT = **5★**, EQUIPMENT = **6★**
- **Intermediate** → BODYWEIGHT = **3★**, EQUIPMENT = **4★**

## Approach
Add one dedicated orchestrator edge function — `generate-category-difficulty-batch` — modeled exactly on `generate-strength-focus-batch` (the function that produced the 24 Strength workouts). Same proven pipeline: library-first `{{exercise:ID:Name}}` markup, banned-name preload, 5-section format, density validation, HTML normalizer + section validator, AI image, then Stripe link.

Run in 2 controlled batches (≤6 workouts/call, well under 150s Edge limit):
1. **Advanced** — Calorie Burning, Metabolic, Cardio × (BW+EQ) → 6 workouts
2. **Intermediate** — Calorie Burning, Metabolic, Cardio × (BW+EQ) → 6 workouts

## Per-workout pipeline (identical to previous batch)
1. **Format**: category-appropriate (Cardio/Calorie Burning/Metabolic are flexible categories — keep `REPS & SETS` or `AMRAP/EMOM/CIRCUIT` style as best fits the chosen exercises; no DB trigger restriction on these categories).
2. **Duration**: 30 min.
3. **Stars** per matrix above; `difficulty` text = "Advanced" or "Intermediate" (auto-synced by `sync_difficulty_from_stars` trigger).
4. **Reasoning prompt** with category, equipment, difficulty, banned-name list (existing names in each category), exercise library reference scoped to category + equipment + difficulty. Difficulty-aware selection (6★ EQ → heavy compound conditioning, kettlebell complexes, barbell complexes; 5★ BW → advanced plyo/calisthenics conditioning; 4★ EQ → moderate dumbbell/kettlebell conditioning; 3★ BW → fundamental cardio/metcon).
5. **Library-first** via `rejectNonLibraryExercises` + `guaranteeAllExercisesLinked`.
6. **5-section format**: Warm-Up, Activation, Main Workout, Finisher, Cool-Down — enforced by `validateWodSections` + density check.
7. **HTML normalize + validate** via `normalizeWorkoutHtml` / `validateWorkoutHtml` (bullets, bold, spacing per standard).
8. **Description (4 sentences), Instructions (5–7 steps), Tips** per standard.
9. **Unique AI image** via `generate-workout-image` → Storage URL on the row.
10. **Insert** in `admin_workouts`:
    - `category` = 'CALORIE BURNING' | 'METABOLIC' | 'CARDIO'
    - `equipment` = 'BODYWEIGHT' | 'EQUIPMENT'
    - `duration` = '30 min'
    - `difficulty_stars` per matrix
    - `is_premium=true`, `is_standalone_purchase=true`, `is_free=false`, `is_visible=true`, `is_workout_of_day=false`, `is_ai_generated=true`
    - `price=3.99`
    - `id` = `PREM-<cat-slug>-<BW|EQ>-<adv|int>-<ts>`
11. **Stripe sync**: deterministic idempotency per workout id → create Product (image, metadata `project=SMARTYGYM`, `content_type=Workout`, category, equipment, stars, `source=generate-category-difficulty-batch`), create Price (€3.99 × 100 EUR), set default_price, write `stripe_product_id` + `stripe_price_id` back to row.

## Verification — MANDATORY before reporting "done"
Single SQL audit over the 12 new IDs, per row:
- `category` matches expected ✓
- `equipment` matches expected ✓
- `difficulty_stars` matches matrix (3/4 intermediate, 5/6 advanced) ✓
- `is_premium=true AND is_standalone_purchase=true AND is_free=false AND is_visible=true AND is_workout_of_day=false` ✓
- `duration='30 min'` ✓
- `main_workout` not null, density passes, all `{{exercise:…}}` tokens resolved ✓
- `image_url` starts with `https://` ✓
- `stripe_product_id` and `stripe_price_id` not null ✓

Then for each Stripe product fetch and assert:
- `metadata.project='SMARTYGYM'`, `metadata.content_type='Workout'` ✓
- `images[0]` equals row's `image_url` ✓
- `default_price` set, unit_amount = 399, currency=eur ✓

Output a numbered confirmation table (1…12) — name, category, equipment, stars, all checks pass/fail. Only if **all 12 rows pass every check** is the task reported done.

## Files to add / change
- NEW: `supabase/functions/generate-category-difficulty-batch/index.ts` (cloned/adapted from `generate-strength-focus-batch`).
- NO changes to existing functions, DB schema, or front-end. No migration.

## Out of scope
- Strength category (already done).
- Other categories (Mobility, Pilates, Recovery, Challenge, Micro).
- WOD cron / library mode.

## Risks & mitigations
- **Edge timeout** → 6 workouts/call (proven).
- **Duplicate names** → banned-name list preloaded per category from existing rows.
- **Stripe failure** → per-workout try/catch; failed link surfaces in response and is caught by verification.
- **Image failure** → insert blocked until image URL present.

## Execution order after approval
1. Write `generate-category-difficulty-batch` edge function.
2. Run Advanced batch (6) → partial verify.
3. Run Intermediate batch (6) → partial verify.
4. Final full 12-row verification (DB + Stripe).
5. Report confirmation table; only then say done.
