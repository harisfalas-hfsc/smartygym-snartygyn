
Goal: restore **Iron Grip Builder** in place (same ID, same product linkage), fix its broken Main Workout, republish it, and clean up the 3 legacy workouts with missing exercise tags.

What I verified from the current backend state:
- **Iron Grip Builder** (`WOD-S-E-1771626610965`) is not deleted; it is `is_visible = false`.
- Its Main Workout section has **0 exercise tags** and only rest lines.
- The same is true for **Align & Restore** (`WOD-MS-E-1771453809150`) (still hidden).
- The other 3 are still visible and were **not hidden/deleted**:
  - `Cardio Kickstart Challenge` (`WOD-CA-E-1765946364498`)
  - `Endurance Drive` (`WOD-CA-EQ-1765083606100`)
  - `Ground Align Thrive` (`WOD-MS-E-1766622604142`)
- Those 3 were flagged because Main Workout has legacy plain-text exercises (no `{{exercise:...}}` tags), not because they were removed.

Implementation plan (no questions, direct execution):

1) Repair Iron Grip Builder main section in-place
- Update backend logic with a targeted repair path (new maintenance edge function) for a specific workout ID.
- For `WOD-S-E-1771626610965`:
  - Fetch workout metadata + current HTML.
  - Rebuild only the **💪 Main Workout** segment (not the whole workout), generating real exercise lines (not rest-only).
  - Run library-first matching + normalization so every exercise gets `{{exercise:ID:Name}}` markup.
  - Validate with section/content gate:
    - Main Workout minimum exercises satisfied.
    - Finisher still valid.
- Save back to the **same row ID** so purchases/links/Stripe metadata stay intact.

2) Republish Iron Grip Builder immediately after passing validation
- Set `is_visible = true` for `WOD-S-E-1771626610965` only after successful content repair.
- Keep `is_workout_of_day` and historical fields as-is (no re-generation/new ID).

3) Fix the 3 legacy “missing tag” workouts (in place, keep visible)
- Reprocess these IDs in place:
  - `WOD-CA-E-1765946364498` (Cardio Kickstart Challenge)
  - `WOD-CA-EQ-1765083606100` (Endurance Drive)
  - `WOD-MS-E-1766622604142` (Ground Align Thrive)
- Apply exercise-linking pipeline on existing content so names become proper `{{exercise:...}}` tags.
- Preserve workout availability (`is_visible` remains true) and existing IDs/products.

4) Verification and report output
- DB checks for each of the 4 IDs:
  - `is_visible` status
  - Main section exercise-tag count (>0 and meets thresholds where required)
- Page-level confirmation:
  - Iron Grip detail endpoint no longer returns “Workout not found”.
- Audit confirmation:
  - Re-run content audit and confirm these records are no longer flagged for “Main Workout has no tags” / rest-only issue.
- Deliver a final report listing exactly what changed per workout (before/after counts and visibility state).

Technical details (files/components touched during implementation):
- `supabase/functions/_shared/section-validator.ts` (already hardened; reuse for gating)
- New maintenance repair function (targeted single-workout main-section repair + publish step)
- Existing reprocessing pipeline function invocation for the 3 legacy records
- No schema change required; only controlled content/visibility data updates
- No new workout IDs will be created for Iron Grip; repair is strictly in-place
