## Goal

Make every Training Program — existing, AI-generated, and admin-created — follow ONE standardized structure that mirrors the attached gold-standard `90-Day Mass Protocol` document.

## The Standardized Format

Each program will follow this exact skeleton, generated once and stored in `weekly_schedule`:

```
📅 WEEK 1
🎯 Objective
<one sentence specific to category + week phase>

① DAY 1 – <Day Title>
• {{exercise:ID:Name}} – sets × reps
• ...

② DAY 2 – <Day Title>
• ...

(...up to days_per_week, with circled numbers ①②③④⑤⑥)

😴 DAY <N+1> – Active Recovery
• Walking
• Mobility
• Stretching

🏁 DAY 7 – Rest
(repeat rest lines if fewer training days)
```

- Repeated for every week (1 → `weeks`).
- `program_structure` becomes a clean phase summary (Foundation → Progressive Overload → Peak → Final Challenge), NOT exercises.
- `progression_plan` becomes the `📝 INSTRUCTIONS` block (general guidelines + periodization explanation).
- A new optional `tips` paragraph (already supported via existing fields) holds the `💡 TIPS` block.
- Exercises ALWAYS use `{{exercise:ID:Name}}` markup so the eye icon appears. Bodyweight programs → only `equipment = body weight` library exercises. Equipment programs → prioritize matching equipment.

## Scope of Changes

### 1. New shared module `supabase/functions/_shared/program-template.ts`
- `buildProgramSkeleton({ category, weeks, daysPerWeek, equipment, difficulty })` → returns the WEEK/DAY/RECOVERY/REST skeleton as a string with placeholders.
- `buildPhaseInstructions(weeks)` → returns the periodization block (`Foundation` 1‑3, `Progressive Overload` mid, `Deload` near 2/3, `Peak`, `Final Challenge`).
- Category → day-title presets (Functional Strength, Hypertrophy, Cardio Endurance, Weight Loss, Mobility & Stability, Low Back Pain). The titles are *suggestions* the AI/admin can overwrite.
- Equipment filter helper used by both AI generation and library selection.

### 2. AI generator (`supabase/functions/generate-admin-program/index.ts`)
- Replace freeform prompt with a STRICT contract: model receives the pre-built week-by-week skeleton and must fill in exercises ONLY using a pre-selected pool of `{{exercise:ID:Name}}` tokens (filtered by category + equipment + difficulty from `public.exercises`).
- Post-process: validate every line in `weekly_schedule` matches `^• \{\{exercise:.+?\}\} – .+$` OR is a recovery/rest bullet. Strip stray prose. Run `guaranteeAllExercisesLinked` + `rejectNonLibraryExercises`.
- Write outputs to: `weekly_schedule` (the weeks), `program_structure` (phase summary), `progression_plan` (instructions), and append tips to `progression_plan` under a `💡 TIPS` heading.

### 3. Admin editor (`src/components/admin/ProgramEditDialog.tsx`)
- Add a "Standardized Training Program Format" button (sibling of any existing template button, mirroring the Workout Editor).
- Clicking it reads `weeks` + `days_per_week` from the current form values and inserts the skeleton (same builder, ported to TS in `src/utils/programTemplate.ts`) into the `weekly_schedule` field. Other fields remain fully editable.
- Exercise insertion already uses the existing rich-text exercise picker → the eye icon is preserved.

### 4. Frontend display (`src/pages/IndividualTrainingProgram.tsx` + `WorkoutDisplay` reuse)
- Ensure the renderer respects line breaks, bullets, and the WEEK/DAY headings so spacing matches the gold standard on desktop and mobile. Reuse the existing `workout-content` wrapper styles for typography rhythm.

### 5. Migration of the 28 existing programs
- New edge function `restructure-training-programs` (admin-only):
  - For each program in `admin_training_programs`, read existing `weekly_schedule`/`program_structure`.
  - Extract any already-linked `{{exercise:ID:Name}}` tokens (preserve all current library links — no exercise loss).
  - Rebuild `weekly_schedule` using the skeleton; redistribute the preserved exercises across the days, padding with library picks (filtered by category + equipment) if a day has fewer than 4 exercises.
  - Rebuild `program_structure` (phases) and `progression_plan` (instructions + tips).
  - Run `reprocess-program-exercises` pipeline at the end so every exercise stays linked.
- Triggered once from the admin panel (or via curl) — no auto-cron.

### 6. Tests
- `supabase/functions/_shared/program-template.test.ts`: skeleton shape per (weeks × days_per_week) matrix, category title presets, equipment filter rejects non-bodyweight when category is bodyweight.
- Generator contract test: invalid exercises are stripped; freeform prose is rejected.

## What is NOT changing

- Database schema (no migration needed — same columns).
- North-Star copy, hero, navigation, theme, WOD pipeline, HFSC, workouts pipeline.
- Pricing, access control, Stripe, leaderboards.

## Verification

- Run `supabase--test_edge_functions` on `generate-admin-program` + `_shared/program-template`.
- Vitest on `src/utils/programTemplate.ts` and the editor template insertion.
- Manually trigger `restructure-training-programs` for one program (`90-Day Mass Protocol` or whichever Hypertrophy/12-week exists), screenshot the result, then run it for all 28.

## Order of execution

1. Build `_shared/program-template.ts` + `src/utils/programTemplate.ts` + tests.
2. Wire the editor button.
3. Update `generate-admin-program` to use the skeleton + strict contract.
4. Build `restructure-training-programs` edge function.
5. Run it on ONE program → verify visually → run on all 28.
6. Deploy + smoke test.
