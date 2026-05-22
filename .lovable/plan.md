# Plan: Generate 4 Premium Workouts (2 Beginner + 2 Advanced)

Same flow as the previous intermediate batch — invoke `generate-category-difficulty-batch` with the existing orchestration (library-first exercises, 5-section structure, AI image, Stripe product + EUR €3.99 one-time price with SMARTYGYM metadata, banned-name uniqueness, density validation).

## Matrix (4 workouts)

Same three categories as before (Calorie Burning, Metabolic, Cardio) rotated across the 4 slots so each level has 1 BW + 1 EQ:

| # | Category         | Equipment  | Difficulty        | Stars | Format  | Duration |
|---|------------------|------------|-------------------|-------|---------|----------|
| 1 | CALORIE BURNING  | BODYWEIGHT | Beginner          | 2★    | AMRAP   | 30 min   |
| 2 | METABOLIC        | EQUIPMENT  | Beginner          | 2★    | CIRCUIT | 30 min   |
| 3 | CARDIO           | BODYWEIGHT | Advanced          | 5★    | EMOM    | 30 min   |
| 4 | CALORIE BURNING  | EQUIPMENT  | Advanced          | 6★    | AMRAP   | 30 min   |

All: `is_premium=true`, `is_standalone_purchase=true`, `tier_required="gold"`, `price=3.99`, `is_visible=true`, `is_workout_of_day=false`.

Difficulty-aware exercise selection (per the standing rule): beginner = simpler bodyweight/light-load picks, longer rest cues, fewer complex compounds; advanced = heavier compounds, advanced progressions, higher density.

## Execution

1. Invoke `generate-category-difficulty-batch` in two calls (one per difficulty) to keep each run well under the 150s Edge ceiling:
   - Call A — Beginner: `{ difficulty: "Beginner", jobs: [{cat:"CALORIE BURNING",eq:"BODYWEIGHT",stars:2,format:"AMRAP"},{cat:"METABOLIC",eq:"EQUIPMENT",stars:2,format:"CIRCUIT"}], price:3.99, tier_required:"gold" }`
   - Call B — Advanced: `{ difficulty: "Advanced", jobs: [{cat:"CARDIO",eq:"BODYWEIGHT",stars:5,format:"EMOM"},{cat:"CALORIE BURNING",eq:"EQUIPMENT",stars:6,format:"AMRAP"}], price:3.99, tier_required:"gold" }`

2. Post-run DB audit on the 4 new rows: verify `image_url`, `stripe_product_id`, `stripe_price_id`, `price=3.99`, `is_premium`, `is_standalone_purchase`, `tier_required="gold"`, correct `difficulty` + `difficulty_stars`, format, duration, visibility, and exercise-token counts.

3. Stripe audit via `verify-workout-stripe-sync` (audit mode). If anything is off, re-run with `?fix=1`.

4. Content sanity check: 5-section order; Main Workout uses the declared format with measurable prescriptions before every `{{exercise:ID:Name}}` token; Finisher + Cool Down present; no durations embedded in protocol headers; Description ≥ 2 sentences; Instructions explains the protocol; Tips are coaching cues.

5. If any generated name lands on a placeholder/collision suffix (as happened last time), rename cleanly in both DB and Stripe.

## Notes

- No code or schema changes. Pure orchestration + verification.
- HFSC untouched. Non-destructive policy applies.
- If you want a different category split (e.g. cover all 3 categories at one level, or mirror the previous 6-slot matrix), say so before approving and I'll update the matrix.
