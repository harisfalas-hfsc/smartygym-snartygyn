

# Permanent Formatting Consistency Fix -- Every Write Path Sealed

## The Real Problem

After a full audit of every function and UI component that writes workout or training program content to the database, I found **7 write paths** that either skip the HTML normalizer entirely or only partially normalize. This is why formatting keeps breaking -- fixing one path leaves others leaking bad HTML into the database.

## Complete Audit Results

| Write Path | What It Does | Has Normalizer? |
|---|---|---|
| `generate-workout-of-day` | Creates daily WODs | Only on `main_workout` (misses description, instructions, tips) |
| `generate-training-program` | Generates program content, returns to frontend | NO |
| `regenerate-broken-programs` | Regenerates corrupted programs | NO |
| `fix-workout-formatting` | Batch fixes workout HTML | NO |
| `repair-content-formatting` | Repairs content spacing | NO |
| `reprocess-wod-exercises` | Re-links exercises in WODs | YES (recently added) |
| `reprocess-program-exercises` | Re-links exercises in programs | YES (recently added) |
| `WorkoutEditDialog.tsx` (Admin UI) | Saves workout edits | Only on `main_workout` (misses finisher) |
| `ProgramEditDialog.tsx` (Admin UI) | Saves program edits | NO |

That is 7 broken paths vs 2 working ones.

---

## The Fix: Seal Every Single Write Path

### 1. `generate-training-program/index.ts`
Add `normalizeWorkoutHtml` import and apply it to the generated content before returning it to the frontend.

### 2. `regenerate-broken-programs/index.ts`
Add `normalizeWorkoutHtml` import. Apply it to `weekly_schedule`, `overview`, and `progression_plan` content before every `.update()` call (both "fix-only" mode at line 257 and "full regeneration" mode at line 376).

### 3. `fix-workout-formatting/index.ts`
Add `normalizeWorkoutHtml` import. Apply it to `main_workout`, `finisher`, `program_structure`, and `weekly_schedule` before every `.update()` call.

### 4. `repair-content-formatting/index.ts`
Add `normalizeWorkoutHtml` import. Apply it to every `repairResult.content` before writing to DB (single target at line 532, batch workouts at line 583, and batch programs at line 667).

### 5. `generate-workout-of-day/index.ts`
Extend the existing normalizer call to also normalize `description`, `instructions`, and `tips` fields before the database insert -- not just `main_workout`.

### 6. `WorkoutEditDialog.tsx` (Admin UI)
Extend the existing normalizer call to also normalize the `finisher` field before saving, in addition to `main_workout`.

### 7. `ProgramEditDialog.tsx` (Admin UI)
Add `normalizeWorkoutHtml` import from `@/utils/htmlNormalizer`. Apply it to `weekly_schedule` (`formData.training_program`) and `program_structure` (`formData.construction`) before the database `.update()` or `.insert()` call.

### 8. Re-run full reprocessing
After deploying all updated functions, trigger `reprocess-wod-exercises` (processAll) and `reprocess-program-exercises` (all programs) to normalize every existing record in the database.

---

## What This Guarantees Going Forward

- Every single path that writes workout or program content to the database will run `normalizeWorkoutHtml` as the absolute last step before the write
- No function can save HTML without proper spacing between sections
- No admin edit can save content without normalization
- The CSS `workout-content` wrapper (already applied in previous fix) ensures consistent display
- Exercise library-first enforcement remains intact in all generation and reprocessing functions
- All existing content gets re-normalized to match the Gold Standard

---

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/generate-training-program/index.ts` | Add normalizer import, apply before return |
| `supabase/functions/regenerate-broken-programs/index.ts` | Add normalizer import, apply before both update paths |
| `supabase/functions/fix-workout-formatting/index.ts` | Add normalizer import, apply before all updates |
| `supabase/functions/repair-content-formatting/index.ts` | Add normalizer import, apply before all updates |
| `supabase/functions/generate-workout-of-day/index.ts` | Extend normalizer to description, instructions, tips |
| `src/components/admin/WorkoutEditDialog.tsx` | Extend normalizer to finisher field |
| `src/components/admin/ProgramEditDialog.tsx` | Add normalizer import, apply to weekly_schedule and program_structure |
| Post-deploy | Reprocess all workouts and programs |

