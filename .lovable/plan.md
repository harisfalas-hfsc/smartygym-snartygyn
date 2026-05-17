
# Plan — 24 Premium Strength Workouts (Focus × Equipment × Difficulty)

## Goal
Create exactly 24 new Strength workouts:
- 6 focuses: LOWER BODY, UPPER BODY, FULL BODY, LOW PUSH & UPPER PULL, LOW PULL & UPPER PUSH, CORE & GLUTES
- For each focus: 1 BODYWEIGHT + 1 EQUIPMENT
- Two difficulty passes: **Advanced** (12) + **Intermediate** (12)
- All **Premium**, all standalone-purchase, all with unique AI image + matching Stripe product/price.

## Difficulty stars (UPDATED)
Differentiate stars by equipment because loaded work is objectively harder than bodyweight at the same tier:
- **Advanced** → BODYWEIGHT = **5★**, EQUIPMENT = **6★**
- **Intermediate** → BODYWEIGHT = **3★**, EQUIPMENT = **4★**

This keeps both tiers covered with the full star range (3, 4, 5, 6) instead of only 3 and 5.

## Approach
Build one dedicated orchestrator edge function — `generate-strength-focus-batch` — modeled on the existing `generate-free-category-workouts` (same proven pipeline: library-first `{{exercise:ID:Name}}` markup, 5-section format, density validation, HTML normalizer, section validator, AI image, then Stripe link).

Body:
```
POST /generate-strength-focus-batch
{ "difficulty": "advanced" | "intermediate",
  "focuses": ["LOWER BODY", ...],
  "equipment": ["BODYWEIGHT","EQUIPMENT"] }
```

Run in 4 controlled batches (~6 workouts each, well under 150s Edge timeout):
1. Advanced — LOWER, UPPER, FULL (BW+EQ → 6)
2. Advanced — LOW PUSH/UP PULL, LOW PULL/UP PUSH, CORE & GLUTES (6)
3. Intermediate — LOWER, UPPER, FULL (6)
4. Intermediate — LOW PUSH/UP PULL, LOW PULL/UP PUSH, CORE & GLUTES (6)

## Per-workout pipeline (existing standards)
1. **Format**: `REPS & SETS`, duration `30 min` (Strength rule, fixed).
2. **Stars**: per matrix above; `difficulty` text = "Advanced" or "Intermediate".
3. **Reasoning prompt** with focus, equipment, difficulty, banned-name list (existing Strength names), exercise library reference scoped to focus + equipment + difficulty.
4. **Library-first** via `rejectNonLibraryExercises` + `guaranteeAllExercisesLinked`. Difficulty-aware exercise selection (e.g. 6★ EQ can use barbell/heavy compound lifts; 5★ BW uses advanced calisthenics; 3★ BW basic compounds; 4★ EQ moderate dumbbell/cable).
5. **5-section format**: Warm-Up, Activation, Main Workout, Finisher, Cool-Down — enforced by `validateWodSections` + density check.
6. **HTML normalize + validate** via `normalizeWorkoutHtml` / `validateWorkoutHtml` (bullets, bold, spacing per standard).
7. **Description, Instructions, Tips** per standard (4-sentence description, 5–7 step instructions, focused tips).
8. **Unique AI image** via `generate-workout-image` → Storage URL on the row.
9. **Insert** in `admin_workouts`:
   - `category='STRENGTH'`, `focus=<focus>`, `equipment=<BW|EQ>`, `format='REPS & SETS'`, `duration='30 min'`
   - `difficulty_stars` per matrix, `difficulty` text
   - `is_premium=true`, `is_standalone_purchase=true`, `is_free=false`, `is_visible=true`, `is_workout_of_day=false`, `is_ai_generated=true`
   - `price=3.99` (current standalone price — confirm or override)
   - `id` = `PREM-STR-<focus-slug>-<BW|EQ>-<adv|int>-<ts>`
10. **Stripe sync** (deterministic idempotency key per workout id): create Product (image, SMARTYGYM metadata, content_type=Workout, focus, equipment, stars), create Price (€price × 100), set default_price, update row with `stripe_product_id` + `stripe_price_id`.

## Verification — MANDATORY before reporting "done"
Single SQL audit over the 24 new IDs, per row:
- `category='STRENGTH'` ✓
- `focus` matches expected ✓
- `equipment` matches expected ✓
- `difficulty_stars` matches expected (5/6 advanced, 3/4 intermediate) ✓
- `is_premium=true AND is_standalone_purchase=true AND is_free=false AND is_visible=true AND is_workout_of_day=false` ✓
- `main_workout` not null, density passes, all `{{exercise:…}}` tokens resolved ✓
- `image_url` starts with `https://` ✓
- `stripe_product_id` and `stripe_price_id` not null ✓

Then for each Stripe product retrieve and assert:
- `metadata.project='SMARTYGYM'`, `metadata.content_type='Workout'` ✓
- `images[0]` equals row's `image_url` ✓
- `default_price` set, unit_amount = €price × 100, currency=eur ✓

Output a numbered confirmation table (1…24) with name, focus, equipment, stars, all 11 checks pass/fail. Only if **all 24 rows pass every check** is the task reported done. Any failure → list it and stop.

## Files to add / change
- NEW: `supabase/functions/generate-strength-focus-batch/index.ts` (~600 lines, reuses shared helpers).
- NO changes to existing functions, DB schema, or front-end. No migration.

## Out of scope
- WOD library mode (untouched).
- Other categories.
- Periodization cron changes.

## Risks & mitigations
- **Edge timeout** → 6 workouts/call (proven by `generate-free-category-workouts`).
- **Duplicate names** → banned-name list preloaded per call from existing Strength workouts.
- **Stripe failure** → per-workout try/catch; failed link surfaces in response and is caught by verification.
- **Image failure** → insert blocked until image URL present (WOD contract).

## Execution order after approval
1. Write the new edge function.
2. Run batch 1 (Advanced × LOWER/UPPER/FULL) → partial verify.
3. Run batches 2, 3, 4 → partial verify each.
4. Final full 24-row verification (DB + Stripe).
5. Report confirmation table; only then say done.
