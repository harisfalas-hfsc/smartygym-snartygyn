

# Fix Corrupted `(male)` / `(female)` Token Repetitions in 25 Workouts

## Root cause

The previous batch-relink job replaced exercise text with `{{exercise:id:name}}` markup, but for library entries whose names end in a parenthetical annotation like `(male)`, `(female)`, or `(beginner)`, the replacement regex left the trailing token un-consumed and then re-emitted it once per match attempt — producing chains of 9–31 duplicated `(male)` tokens after the closing `}}`.

## What I'll fix

**Scope:** 25 workouts. Zero training programs. Only the corrupted token sequences — no other content touched.

**Affected records (by id):**
- WODs: WOD-S-B-1768343408374 (Gluteal Anchor), WOD-S-B-1767393007630, WOD-CH-B-1767163844535, WOD-CH-B-1765776894884, WOD-CH-B-1769985007209, WOD-CB-1764399612573, WOD-M-1764486040577, WOD-CA-E-1765946364498, WOD-MS-E-1768170609085, WOD-20241124, WOD-20241125, WOD-20241126, WOD-20241127
- Pilates: PIL-001 through PIL-006
- Recovery: rec-001 through rec-004
- Mobility: M-003, M-005

## Fix logic

Run a single SQL migration that, for each corrupted column (`main_workout`, `finisher`, `warm_up`, `cool_down`, `activation`):

1. Use `regexp_replace` to collapse runs of `}} (male) (male) (male) ...` → `}}` (the original `(male)` is already inside the `{{exercise:id:name (male)}}` markup, so the trailing duplicates are pure noise).
2. Same pass for `(female)` and any other repeated `\([a-z]+\)` token (3+ in a row, case-insensitive).
3. Preserve the `-12 reps (3-1-1-0 tempo, 90 sec rest)` text that follows the duplicated tokens.

**Pattern (Postgres regex):**
```
regexp_replace(col, '(\}\})\s*(\([a-zA-Z]+\)\s*){2,}', '\1', 'g')
```
This keeps the closing `}}` and removes 2+ trailing parenthetical tokens.

## Verification after fix

1. Re-run the two detector queries — both must return zero rows.
2. Spot-check Gluteal Anchor's `main_workout` to confirm it reads:
   `{{exercise:3523:glute bridge two legs on bench (male)}}-12 reps (3-1-1-0 tempo, 90 sec rest)`
3. Open `/workouts/WOD-S-B-1768343408374` in the preview to confirm rendering.

## Prevent recurrence

Patch `supabase/functions/batch-relink-exercises/index.ts` (and the matching helper in `supabase/functions/fix-workout-formatting/index.ts`) so the matcher consumes the trailing parenthetical suffix as part of the exercise name, not as separate floating text. Add a guard that refuses to write output containing `}} (word) (word)` patterns.

## Files / DB touched

- **DB migration:** UPDATE `admin_workouts` for the 25 ids above.
- **Code:** `supabase/functions/batch-relink-exercises/index.ts`, `supabase/functions/fix-workout-formatting/index.ts` — fix the regex that strips/re-emits exercise-name suffixes.

## What I will NOT touch

- The exercise library itself (the `(male)` / `(female)` suffixes in exercise names are intentional — they distinguish gendered demo variants).
- Training programs (none affected).
- Any non-corrupted workout content.
- Layout, theme, or rendering code.

