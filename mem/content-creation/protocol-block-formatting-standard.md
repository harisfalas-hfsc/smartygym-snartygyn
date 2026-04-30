---
name: Protocol Block Formatting Standard
description: Protocol headers must never embed durations; exercise tokens need measurable prescriptions; no stray text after }}; explanations live in Instructions.
type: feature
---

# Protocol Block Formatting Standard

Mandatory rules enforced in WOD generation prompts, post-generation validators, and library repair sweeps.

## Rule 1 — No durations in protocol headers
- WRONG: `Main Workout (TABATA 24')`, `Finisher (TABATA 11')`, `Finisher (15-minute EMOM)`, `Main Workout (AMRAP 12 min)`
- RIGHT: `Main Workout (TABATA)`, `Finisher (EMOM)`, `Finisher (AMRAP)`, `Finisher (For Time)`
- Why: Tabata math (8 × 30 sec = 4 min per exercise) and EMOM math depend on the body of the block. Embedding the wrong number in the header confuses users.
- The protocol explanation lives in the `instructions` field, not the workout body.

## Rule 2 — No stray text after `}}` of an exercise token
- WRONG: `{{exercise:0725:single arm push-up}}20 sec interval)`
- RIGHT: `20 sec {{exercise:0725:single arm push-up}}`
- Modifiers (reps, sides, weight, intervals) come BEFORE the token.

## Rule 3 — EMOM blocks must label every minute and have no orphan exercises
- Every minute from 1 to N must be labelled `<strong>Minute N:</strong>` in order.
- No bullet may exist after the last labelled minute.
- For repeating patterns: write the pattern once, then add a separate paragraph "Repeat X rounds = total minutes".

## Rule 4 — No naked exercise prescriptions in Main Workout or Finisher
- Every exercise token in Main Workout and Finisher must have a measurable dose before the token: reps, seconds, minutes, meters, km, miles, calories, rounds, sets x reps, or a clear bare rep count.
- WRONG: `{{exercise:0685:run}} (equipment) on treadmill (fast pace)`
- RIGHT: `400m {{exercise:0685:run}} on treadmill (fast pace)` or `60 sec {{exercise:0685:run}} on treadmill (fast pace)`.
- Why: users must know exactly what to do. An exercise name alone is not coaching.

## Enforcement layers
1. **Prompt rules** in `generate-workout-of-day` STRUCTURAL_RULES block.
2. **`validateProtocolBlocks`** in `_shared/protocol-sanitizer.ts` — blocks generation if violated.
3. **`sanitizeProtocolBlocks`** auto-cleans deterministic noise before save.
4. **`injectProtocolExplanations`** from `_shared/protocol-explanations.ts` ensures every protocol workout teaches its format.
5. **`repair-workout-content`** edge function + library SQL sweep cleans existing content.
6. **`workout_repair_log`** table records every change for admin review.
