

# Fix Broken Workouts + Full Content Quality Scan

## Problem

Two known workouts (**Iron Grip Builder** and **Align & Restore**) have Main Workout sections containing only rest instructions with zero actual exercises. The current section validator only checks for icon presence, not exercise content. There may be more broken workouts and training programs across all categories.

## Plan

### Phase 1: Scan all existing content for quality issues

Create a new edge function `scan-content-quality` (or extend `audit-content-formatting`) that checks every workout and training program for:

1. **Empty exercise sections** — sections that have the icon header but contain no `{{exercise:...}}` tags or no `<li>` exercise items
2. **Rest-only sections** — sections where the only content is rest instructions (e.g., "Rest 60-90 seconds") with no exercises
3. **Missing section icons** — already covered by existing audit but re-run as part of this scan

The scan will query all rows from `admin_workouts` and `admin_training_programs`, parse the `main_workout` HTML, and return a report of every broken item with its ID, name, category, and specific issues found.

### Phase 2: Fix the two known broken workouts

- Set `is_visible = false` for **Iron Grip Builder** (`WOD-S-E-1771626610965`) and **Align & Restore** (`WOD-MS-E-1771453809150`) via database migration
- These workouts have fundamentally broken content that cannot be patched — they need regeneration

### Phase 3: Fix any additional broken items found in Phase 1

- For any other workouts/programs found with similar issues (empty exercise sections, rest-only content), set `is_visible = false` via the same migration
- Provide a full report of all affected items

### Phase 4: Harden the section validator to prevent future occurrences

Update `supabase/functions/_shared/section-validator.ts`:

- Add exercise content validation: count `{{exercise:` tags or `<li>` items between each pair of section icons
- Add `mainWorkoutExerciseCount` and `finisherExerciseCount` to the validation result
- Add `hasMinimumExercises` boolean (min 3 for Main Workout, min 1 for Finisher)

Update `supabase/functions/generate-workout-of-day/index.ts` (~line 2459):

- After the existing section icon gate, add exercise count check
- Reject any WOD where Main Workout has fewer than 3 exercises or Finisher has fewer than 1

### Files to modify

1. **`supabase/functions/_shared/section-validator.ts`** — add exercise count validation
2. **`supabase/functions/generate-workout-of-day/index.ts`** — add exercise count gate after section icon gate
3. **Database migration** — hide broken workouts (and any others found in scan)
4. **`supabase/functions/audit-content-formatting/index.ts`** — add rest-only / empty-exercise detection to the audit checks

### Execution order

1. First, run a database query to scan all workouts and programs for empty/rest-only sections
2. Review results and identify all broken items
3. Apply database migration to hide all broken items
4. Update the validator and generation pipeline to prevent future occurrences
5. Update the audit function so future audits catch this class of issue

