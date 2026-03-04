
## What I found (root causes)
1) **Pilates “Equipment” WOD is pulling gym machines on purpose (by current logic).**  
In `supabase/functions/generate-workout-of-day/index.ts`, Pilates Equipment guidance currently allows “gym equipment alternatives”, and the **exercise library passed to the AI + post-processing matching includes machine exercises**, so things like:
- `lever seated hip abduction` / `lever seated crunch` / `lever seated hip adduction`
can be selected and will remain valid because they exist in the exercise library.

2) **You already have many Pilates workouts (not just today) that contain non-studio equipment.**  
Database shows **22 visible Pilates workouts** (11 BODYWEIGHT, 11 EQUIPMENT). Many contain **barbell/dumbbell/leverage machine/smith machine/cable/kettlebell**, etc.

3) **The “Cocoons” GIF URL is publicly accessible.**  
`cocoons (0260)` has a valid `gif_url` and the storage bucket is public. So the “empty screen” issue is most likely **frontend rendering / load failure without fallback UI** (e.g., image decode/load failure, network hiccup, or device-specific behavior). We should add a robust fallback.

4) **The exercise library has almost no explicit Pilates tagging.**  
Only **one** exercise is categorized as `pilates` in the exercise library (`The Hundred`). So the only reliable way to enforce Pilates-studio realism right now is by **equipment constraints + additional guardrails**, not “Pilates-only tagged exercises”.

---

## Your decisions captured
- Pilates days should **keep 2 WODs** (Bodyweight + Equipment).
- Apply cleanup to **all Pilates history** (and today).

---

## Goal (what we’ll build)
1) **Hard-enforce “Pilates studio equipment only” for Pilates EQUIPMENT workouts** (bands/mini-bands, stability ball, medicine ball, roller, bosu, rope if needed, plus bodyweight).  
2) **Automatically repair all existing Pilates workouts** to remove/replace machine/heavy-gym exercises so you can safely sell/deliver Pilates content.  
3) **Fix/guard the exercise “View” modal so if a GIF fails to load, users see a clear fallback instead of a blank/empty area.**

---

## Design approach
### A) Pilates Equipment allowlist (strict)
Define an allowlist for Pilates studio-style tools (based on `exercises.equipment`):
- Always allowed: `body weight` (and casing variants)
- Allowed props: `band`, `resistance band`, `stability ball`, `medicine ball`, `roller`, `bosu ball`, `rope`  
Strictly **disallow**: `leverage machine`, `smith machine`, `barbell`, `dumbbell`, `kettlebell`, `cable`, `weighted`, etc.

This becomes a **hard gate** in two places:
1) What the AI is allowed to see (prompt library list)
2) Post-processing matching + final rejection (so even if the AI tries, forbidden exercises get substituted/removed)

### B) WOD generation changes (Pilates only)
In `generate-workout-of-day`:
1) When `category === "PILATES"` and `equipment === "EQUIPMENT"`:
   - Build **filtered exercise library** = allowlist props + bodyweight.
   - Use that filtered list for:
     - the AI prompt’s exercise reference list
     - post-processing (`processContentSectionAware`, `guaranteeAllExercisesLinked`, `rejectNonLibraryExercises`)
2) Strengthen Pilates EQUIPMENT prompt copy:
   - Explicitly forbid machines and gym equipment
   - Emphasize studio Pilates props + controlled tempo + alignment

### C) Bulk repair existing Pilates workouts (today + history)
Create a dedicated backend function (e.g. `repair-pilates-workouts`) that:
1) Loads all Pilates workouts (or runs in batches).
2) Loads exercise library once.
3) Builds the Pilates allowlist pool.
4) For each Pilates workout field (`activation`, `warm_up`, `main_workout`, `finisher`, `cool_down`, plus optionally `tips/instructions/notes`):
   - Strips existing `{{exercise:...}}` markup back to plain names (to avoid “locked-in” bad IDs).
   - Re-runs matching + final sweep + strict rejection **against the allowlist pool**.
   - Result: any machine-based lines get **substituted to the closest allowed prop/bodyweight exercise**, or removed if no safe match exists.
5) Safety:
   - If a workout ends up with too few linked exercises (configurable threshold), we will optionally set `is_visible=false` and log it for manual review (prevents customers buying broken Pilates workouts).

After running this function once, your full Pilates library (including today’s WODs) will be cleaned.

### D) “View exercise” blank GIF fallback
In `src/components/ExerciseDetailModal.tsx`:
- Add `onError` + `onLoad` handling for the `<img src={exercise.gif_url}>`.
- While loading: show a small skeleton/spinner in the image container.
- On error: show the existing “GIF not available yet” placeholder (or “Image failed to load. Try again.”) instead of an empty area.

This does not change your data; it prevents user-facing “blank” experiences.

---

## Implementation steps (exact)
1) **Backend: add Pilates allowlist helper**
   - Add a small helper (either inside `generate-workout-of-day` or in `_shared`) that:
     - normalizes `exercises.equipment` values
     - filters the exercise list to Pilates-allowed equipment

2) **Backend: update `generate-workout-of-day`**
   - When Pilates + EQUIPMENT:
     - create `pilatesEquipmentExercises` (filtered allowlist)
     - create a **pilates-only reference list** for the AI prompt (from the filtered set)
     - ensure post-processing uses that filtered set (not the full library)
   - Add a final “Pilates equipment audit” step:
     - parse markup IDs, confirm all belong to allowlist set; if not, re-run strict rejection with allowlist

3) **Backend: create `repair-pilates-workouts` function**
   - Parameters:
     - `processAll: true|false`
     - `batchOffset`, `batchSize`
     - optional `dryRun`
   - Behavior:
     - update Pilates workouts in place (non-destructive)
     - write a summary response (how many repaired, how many hidden for review)

4) **Run the repair**
   - Execute `repair-pilates-workouts` in batches until all Pilates workouts are processed.
   - Re-check today’s WODs to confirm machine exercises are gone.

5) **Frontend: fix ExerciseDetailModal image fallback**
   - Add image load state + onError fallback UI.
   - (Optional) add a “Retry” button that just re-renders the image element.

6) **Verification checklist (must-do)**
   - Open today’s Pilates EQUIPMENT WOD:
     - confirm no leverage machine / barbell / dumbbell / cable exercises appear
     - confirm no duplicated exercise lines in the same section (we’ll add a small dedupe pass if needed)
   - Tap **View** on `cocoons`:
     - confirm the modal shows either the GIF or a clear fallback (never blank)
   - Spot-check 5–10 repaired Pilates workouts from history (both EQUIPMENT and BODYWEIGHT).

---

## Notes / constraints (so expectations are clear)
- With the current exercise library, we can enforce **Pilates studio equipment realism** very reliably.  
- Full “pure Pilates repertoire” (Teaser, Roll Up, Swan, Mermaid, Side Kick Series, etc.) is limited because the library doesn’t currently contain many of those movements by name/category. If you want, the next step after this fix is adding a curated Pilates exercise set into the library and tagging them—then Pilates generation can become extremely strict and classical.

---