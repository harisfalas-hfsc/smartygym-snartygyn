## Goal

Restructure all 30 visible training programs so each scheduled day contains a **full SmartyGym workout** (not 5–6 bullet lines), and update the program generator to do the same for every future program.

## What Changes

### 1. Per-Day Workout Structure (the core fix)

Each Day inside a program will render like an embedded SmartyGym workout, using the **same 5-section structure** as standalone workouts:

```
DAY 1 — [Session Title]
[1-paragraph coaching note: why this session today, what to focus on, what to avoid]

🔥 Soft Tissue Preparation (3–5 min)
• [exercises with prescriptions]

⚡ Activation / Warm-Up (5–8 min)
• [exercises]

🏋 Main Workout (20–45 min depending on difficulty)
• {{exercise:ID:Name}} — sets × reps, rest, %1RM/load cue
• ...

💥 Finisher (4–8 min)
• [conditioning/density block]

🧘 Cool Down (5 min)
• [stretches/breathing]
```

No per-day "Description / Tips / Instructions" headings — just the single coaching paragraph + the 5 workout sections. Program-level Description, Goal, Phases, Progression Instructions, Tips stay where they are.

### 2. Realistic Durations (by difficulty)

| Difficulty | Total session target |
|---|---|
| Beginner | 40–50 min |
| Intermediate | 55–65 min |
| Advanced | 70–80 min |

Exercise count and set volume scale to hit those windows. No more "5 exercises × 60 sec = 5 min" sessions.

### 3. Phased Periodization with Workout Reuse

Generator picks 1–4 phases based on program length:
- 4 wk → 2 phases
- 6 wk → 3 phases (2+2+2)
- 8 wk → 3 phases (3+2+3) or 4 phases
- 12 wk → 4 phases (3+4+1 deload+4)

Within a phase, the **same daily workouts repeat** week-to-week with progression applied (load %, volume, density, intensity, complexity — chosen by category).

### 4. Category-Specific Progression Models

- **Muscle Hypertrophy** — %1RM ladder (65→70→75→80), volume waves
- **Functional Strength** — load + sets/reps + complexity
- **Cardio Endurance** — distance / duration / pace / intervals / work:rest
- **Weight Loss** — volume, density, work capacity, circuit difficulty
- **Low Back Pain** — quality / stability / pain-free, no aggressive jumps
- **Mobility & Stability** — ROM, control, balance, complexity

### 5. Backfill All 30 Existing Programs

Run the new generator's "rebuild weekly schedule" path against every visible program (excluding HFSC, per project rule). Preserve: name, category, description, overview, target audience, difficulty, weeks, days/week, image, price, Stripe links, visibility. Only the `weekly_schedule` field is rewritten.

### 6. Library-First Exercise Selection (unchanged)

Continue using `{{exercise:ID:Name}}` markup from the existing library, filtered by category → equipment → difficulty → muscle/focus, with family-diversity (no repeating push/pull/hinge in same session unless pool exhausted).

## Technical Details

**Files to edit:**
- `supabase/functions/_shared/program-template.ts` — replace `defaultSessionTemplate()` with new 5-section full-workout template; add `buildFullSessionWorkout(category, difficulty, phase, dayFocus, libraryExercises)`
- `supabase/functions/_shared/program-exercise-picker.ts` — return enough exercises per day for a full session (8–14 depending on difficulty), grouped by section
- `supabase/functions/generate-admin-program/index.ts` — call new builder; add phase planning step and per-category progression rules; remove the bullet-line skeleton path for daily workouts
- `supabase/functions/restructure-training-programs/index.ts` — switch to new builder; iterate all 30 visible non-HFSC programs and overwrite `weekly_schedule`
- `src/utils/programTemplate.ts` — mirror the shared template (admin editor "Standardized Format" button)

**Validation:**
- Density check: each Day must have ≥ minimum exercises for its difficulty tier (Beginner 6, Intermediate 8, Advanced 10) across all sections combined
- Total-time check: estimated minutes within the difficulty window
- Reject and retry if either fails (existing retry harness in `wod-generation-reliability` style)

**Deployment order:**
1. Update shared templates + picker
2. Update generator + restructure function
3. Invoke `restructure-training-programs` to rebuild all 30
4. Verify with `htmlNormalizer.test.ts` + spot-check 2 programs via DB read

**What is NOT changing:**
- Standalone workout generator (untouched, per your rule)
- Program-level metadata (description/overview/etc.)
- HFSC content (locked, per core memory)
- Visual layout / CSS / week & day headings / dividers
- Exercise library data
