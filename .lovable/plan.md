# Plan: Generate 12 Premium Workouts (Beginner + Advanced full matrix)

Same orchestration as the previous intermediate batch via `generate-category-difficulty-batch`: library-first exercise selection, 5-section structure, AI image, Stripe product + EUR €3.99 one-time price with SMARTYGYM metadata, banned-name uniqueness, density + protocol validation.

## Matrix (3 × 2 × 2 = 12 workouts)

| # | Category         | Equipment  | Difficulty | Stars | Format  | Duration |
|---|------------------|------------|------------|-------|---------|----------|
| 1 | CALORIE BURNING  | BODYWEIGHT | Beginner   | 2★    | AMRAP   | 30 min   |
| 2 | CALORIE BURNING  | EQUIPMENT  | Beginner   | 2★    | AMRAP   | 30 min   |
| 3 | METABOLIC        | BODYWEIGHT | Beginner   | 2★    | CIRCUIT | 30 min   |
| 4 | METABOLIC        | EQUIPMENT  | Beginner   | 2★    | CIRCUIT | 30 min   |
| 5 | CARDIO           | BODYWEIGHT | Beginner   | 2★    | EMOM    | 30 min   |
| 6 | CARDIO           | EQUIPMENT  | Beginner   | 2★    | EMOM    | 30 min   |
| 7 | CALORIE BURNING  | BODYWEIGHT | Advanced   | 5★    | AMRAP   | 30 min   |
| 8 | CALORIE BURNING  | EQUIPMENT  | Advanced   | 6★    | AMRAP   | 30 min   |
| 9 | METABOLIC        | BODYWEIGHT | Advanced   | 5★    | CIRCUIT | 30 min   |
| 10| METABOLIC        | EQUIPMENT  | Advanced   | 6★    | CIRCUIT | 30 min   |
| 11| CARDIO           | BODYWEIGHT | Advanced   | 5★    | EMOM    | 30 min   |
| 12| CARDIO           | EQUIPMENT  | Advanced   | 6★    | EMOM    | 30 min   |

Mirrors the intermediate batch (3★ BW / 4★ EQ) → Beginner uses 2★ both, Advanced uses 5★ BW / 6★ EQ.

All flags: `is_premium=true`, `is_standalone_purchase=true`, `tier_required="gold"`, `price=3.99`, `is_visible=true`, `is_workout_of_day=false`.

Difficulty-aware exercise selection per the standing rule: beginner = simpler picks, longer rest cues, fewer complex compounds; advanced = heavier compounds, advanced progressions, higher density.

## Execution

1. Six sequential invocations of `generate-category-difficulty-batch` (one per category × difficulty pair = 2 jobs each), to stay safely under the 150s Edge ceiling:

   - **B1** Beginner / CALORIE BURNING → [BW 2★ AMRAP, EQ 2★ AMRAP]
   - **B2** Beginner / METABOLIC → [BW 2★ CIRCUIT, EQ 2★ CIRCUIT]
   - **B3** Beginner / CARDIO → [BW 2★ EMOM, EQ 2★ EMOM]
   - **A1** Advanced / CALORIE BURNING → [BW 5★ AMRAP, EQ 6★ AMRAP]
   - **A2** Advanced / METABOLIC → [BW 5★ CIRCUIT, EQ 6★ CIRCUIT]
   - **A3** Advanced / CARDIO → [BW 5★ EMOM, EQ 6★ EMOM]

   Each call: `{ price: 3.99, tier_required: "gold", is_premium: true, is_standalone_purchase: true, is_visible: true }`.

2. Per-call DB audit on the 2 new rows: `image_url`, `stripe_product_id`, `stripe_price_id`, `price=3.99`, `is_premium`, `is_standalone_purchase`, `tier_required="gold"`, correct `difficulty` + `difficulty_stars`, format, duration, visibility, exercise-token counts.

3. Final Stripe audit via `verify-workout-stripe-sync` (audit mode). Re-run with `?fix=1` if any of the 12 are off.

4. Content sanity sweep: 5-section order; Main Workout uses declared format with measurable prescription before every `{{exercise:ID:Name}}`; Finisher + Cool Down present; no durations in protocol headers; Description ≥ 2 sentences; Instructions explains the protocol; Tips are coaching cues.

5. Clean-name pass: if any generated name falls back to a generic/collision suffix, rename in both DB and Stripe (as done last time).

## Notes

- No code or schema changes — pure orchestration + verification.
- HFSC untouched. Non-destructive policy applies.
- Total expected cost: 12 AI workouts + 12 images + 24 Stripe writes. Runs in ~6 sequential batches.
