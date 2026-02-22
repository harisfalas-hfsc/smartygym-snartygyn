

# Fix Formatting Consistency Across ALL Workouts and Training Programs

## Root Cause Analysis

There are TWO separate problems causing the missing spacing between sections:

### Problem 1: The reprocessors NEVER normalize HTML
The `reprocess-wod-exercises` and `reprocess-program-exercises` functions do exercise matching but **never call `normalizeWorkoutHtml()`**. This means:
- When we reprocess all 224 workouts and 28 programs, the HTML is saved back WITHOUT proper spacing normalization
- Empty paragraphs between sections may be missing, duplicated, or malformed
- Newlines and whitespace between tags are not cleaned

Only `generate-workout-of-day` calls the normalizer on new WODs. All existing content that was reprocessed lost its formatting guarantees.

### Problem 2: Training programs and Reader Mode lack the `workout-content` CSS wrapper
The CSS rules that enforce proper section spacing (`.workout-content` class) are only applied in ONE place:
- `WorkoutDisplay.tsx` wraps workout content in `<div className="workout-content">` (line 269) -- this works
- Training program `weekly_schedule` (line 291) -- **NO wrapper, broken formatting**
- Training program `programContent` (line 307) -- **NO wrapper, broken formatting**  
- Reader Mode in `IndividualWorkout.tsx` (line 268) -- **NO wrapper, broken formatting**
- Reader Mode in `IndividualTrainingProgram.tsx` (line 242) -- **NO wrapper, broken formatting**

Without the `workout-content` class, the CSS rules for zero-margin paragraphs, proper empty-paragraph height (0.75rem), and compact list styling do not apply.

---

## Fix Plan

### Fix 1: Add `normalizeWorkoutHtml` to both reprocessor functions
Update `reprocess-wod-exercises/index.ts` and `reprocess-program-exercises/index.ts` to import and call `normalizeWorkoutHtml()` on every field AFTER exercise matching and rejection, right before saving to the database.

**Files:**
- `supabase/functions/reprocess-wod-exercises/index.ts` -- add import of `normalizeWorkoutHtml` from `../_shared/html-normalizer.ts` and apply it to all update fields before the database write
- `supabase/functions/reprocess-program-exercises/index.ts` -- same treatment

### Fix 2: Wrap ALL content displays in `workout-content` class
Add the `workout-content` wrapper div around training program content and Reader Mode content so the Gold Standard CSS rules apply everywhere.

**Files:**
- `src/components/WorkoutDisplay.tsx` -- wrap `weekly_schedule` (line 291) and `programContent` (line 307) in `<div className="workout-content">`
- `src/pages/IndividualWorkout.tsx` -- wrap the Reader Mode content div (line 268) in `<div className="workout-content">`
- `src/pages/IndividualTrainingProgram.tsx` -- wrap the Reader Mode content div (line 242) in `<div className="workout-content">`

### Fix 3: Redeploy and reprocess all existing content
After deploying the updated reprocessor functions:
1. Trigger `reprocess-wod-exercises` with `processAll: true` for all workouts (in batches)
2. Trigger `reprocess-program-exercises` for all programs

This will normalize ALL existing HTML in the database, ensuring every workout and program has proper empty paragraphs between sections.

---

## What This Guarantees

- Every workout and training program will have properly normalized HTML in the database (newlines stripped, whitespace collapsed, empty paragraphs between sections)
- Every display location (main view, training programs, Reader Mode) will use the `workout-content` CSS class for consistent spacing
- The normalizer runs as the LAST step before database writes, so exercise matching cannot break formatting
- All 224 workouts and 28 training programs will be re-normalized

---

## Technical Summary

| File | Change |
|------|--------|
| `supabase/functions/reprocess-wod-exercises/index.ts` | Import and apply `normalizeWorkoutHtml` to all fields before DB update |
| `supabase/functions/reprocess-program-exercises/index.ts` | Import and apply `normalizeWorkoutHtml` to all fields before DB update |
| `src/components/WorkoutDisplay.tsx` | Wrap training program content sections in `workout-content` div |
| `src/pages/IndividualWorkout.tsx` | Wrap Reader Mode content in `workout-content` div |
| `src/pages/IndividualTrainingProgram.tsx` | Wrap Reader Mode content in `workout-content` div |
| Post-deploy | Reprocess all 224 workouts + 28 programs with updated functions |
