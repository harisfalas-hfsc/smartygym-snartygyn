# Fix Today's WODs (2026-05-15)

Both live WODs are missing round prescriptions on the Finisher block, and the bodyweight WOD's advertised duration (11 min) is unrealistic for an Advanced session. Protocols stay exactly as-is — only the finisher round count and the duration field change.

## WOD 1 — Granite Coil Press (Bodyweight, Advanced, MIX)

Current duration: **11 min** → Realistic for the prescribed work.

Main Workout (unchanged):
- 4 sets × 6 reps drop jump squat
- 3 sets × 8 reps side-lying biceps curl
- 3 sets × 10 reps squatting row

Finisher (For Time) — currently no round count. Add:
> **Complete 3 rounds for time:**
> - 12 reps burpee
> - 16 reps posterior step to overhead reach
> - 12 reps standing one-arm row

Recalculated duration:
- Main: 10 working sets × ~60 sec work + ~45 sec rest ≈ **16–18 min**
- Finisher: 3 rounds × ~2 min ≈ **6 min**
- **New advertised duration: 23 min**

## WOD 2 — Arcane Descent Test (Equipment, Advanced, EMOM)

Current duration: **29 min**.

Main Workout (EMOM, unchanged): 5 exercises × 5 rounds = 25 min.

Finisher (For Time) — currently no round count. Add:
> **Complete 3 rounds for time:**
> - 12 reps barbell thruster
> - 16 reps band step-up
> - 12 reps alternate lateral pulldown

Recalculated duration:
- Main EMOM: **25 min**
- Finisher: 3 rounds × ~2.5 min ≈ **7 min**
- **New advertised duration: 32 min**

## What I will change (data-only, no code)

For each of the two workout rows in `admin_workouts`:
1. Update `main_workout` HTML: insert one paragraph immediately after the `Finisher (For Time)` heading reading `Complete 3 rounds for time:` (using the existing `tiptap-paragraph` markup, no protocol or list changes).
2. Update `duration` to `23 min` and `32 min` respectively.

Nothing else is touched: format stays MIX / EMOM, exercise tokens stay identical, warm-up / activation / cool-down stay identical, no exercises added or swapped.

## Out of scope
- No change to the WOD generator prompts in this pass (you've asked me to only fix today's two workouts).
- No re-generation, no image regeneration, no Stripe changes.
