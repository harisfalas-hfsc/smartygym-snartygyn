# Generate 10 New Free Intermediate Workouts

## What you'll get
**10 brand-new workouts**, 2 per category × 5 categories. All Intermediate (3★). All FREE — no Stripe product, accessible to any logged-in user.

| # | Category | Equipment | Format |
|---|---|---|---|
| 1 | STRENGTH | BODYWEIGHT | REPS & SETS |
| 2 | STRENGTH | EQUIPMENT | REPS & SETS |
| 3 | CALORIE BURNING | BODYWEIGHT | TABATA / AMRAP / CIRCUIT (rotated) |
| 4 | CALORIE BURNING | EQUIPMENT | TABATA / AMRAP / CIRCUIT (rotated) |
| 5 | METABOLIC | BODYWEIGHT | TABATA / EMOM / CIRCUIT (rotated) |
| 6 | METABOLIC | EQUIPMENT | TABATA / EMOM / CIRCUIT (rotated) |
| 7 | CARDIO | BODYWEIGHT | EMOM / AMRAP / CIRCUIT (rotated) |
| 8 | CARDIO | EQUIPMENT | EMOM / AMRAP / CIRCUIT (rotated) |
| 9 | MOBILITY & STABILITY | BODYWEIGHT | REPS & SETS |
| 10 | MOBILITY & STABILITY | EQUIPMENT | REPS & SETS |

## Per-workout deliverables (each of the 10)
- **Unique name** — 2-4 word creative name, globally deduped against ALL existing workouts. Banned-word list applied (no "Inferno", "Beast", "Elite", etc.).
- **Unique AI-generated image** — created synchronously per workout via `generate-workout-image`; DB trigger as backup if it fails.
- **Description** — 2-3 sentence intro paragraph.
- **Instructions** — How to perform the workout.
- **Tips** — 3 coaching tips.
- **Main workout** — Full 5-section structure with `workout-content` wrapper:
  1. 🧽 Soft Tissue Preparation
  2. 🔥 Activation
  3. 💪 Main Workout (≥3 exercises with prescriptions)
  4. ⚡ Finisher (≥1 exercise)
  5. 🧘 Cool Down
- **Library-first markup** — every exercise uses `{{exercise:ID:Name}}`. 4-layer enforcement rejects any non-library exercise.
- **Correct prescriptions** — sets × reps + tempo + rest for REPS & SETS; work/rest intervals or rounds for timed formats.
- **Category-specific coaching logic**:
  - Strength: compound primary lift first, then accessories
  - Mobility & Stability: controlled tempo, isometric holds, banded/PNF work
  - Cardio: continuous activity, no reps & sets
  - Metabolic: full-body compound, minimal rest
  - Calorie Burning: sustained high-output plyometrics + compounds
- **Difficulty-aware exercise pool** — only Intermediate-appropriate movements.
- **Density validation** — minimum exercise counts enforced; rejected workouts are retried.
- **HTML normalization** — section icons, bullet structure, spacing all sanitized.

## Free access guarantees (per row)
- `is_free = true`
- `is_premium = false`
- `is_standalone_purchase = false`
- `price = null`
- `stripe_product_id = null`, `stripe_price_id = null` → **NO Stripe product is ever created**
- `is_visible = true`, `is_workout_of_day = false`
- Visible to all logged-in users via the existing `Signed in users can view accessible workouts` RLS policy.

## How it will be done
1. **Patch `generate-free-category-workouts`** to support an `allow_duplicates: true` flag — a 5-line change so the function generates fresh workouts instead of skipping slots that already have free entries. Default behavior is unchanged (the existing backfill cron is unaffected).
2. **Deploy** the updated function.
3. **Invoke once** with all 10 jobs, `allow_duplicates: true`, `difficulty: "Intermediate"`, `difficulty_stars: 3`. Each workout generates with 2 internal retries on failure.
4. **Monitor logs live** for AI failures, library-mismatch rejections, or section/density errors. Re-invoke any single slot that exhausts retries.
5. **Verify in DB** — query the 10 new rows; confirm all flags, image_url present, 5 sections in main_workout.
6. **Image backfill check** — if any image is still pending after 60s, the existing trigger will fill it; I'll re-check.
7. **Report back** the full list (id, name, category, equipment, format, image_url) for spot-checking on the front-end.

## Confirmed: WOD generation is NOT affected
The "skip if exists" behavior only ever existed in this one backfill function. The daily WOD cron (`generate-workout-of-day` / `wod-generation-orchestrator`) does not have this logic and is untouched by this plan.
