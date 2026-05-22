# Plan: Generate 6 Premium Intermediate Workouts

Create 6 premium workouts using the existing `generate-category-difficulty-batch` edge function — the same orchestrator used to produce the current `PREM-*` library entries (Kinetic Cascade Apex, Metabolic Mesh, Cadence Pulse Trail, etc.). Same style, structure, formatting, image, and Stripe wiring as those workouts.

## Matrix (6 workouts)

| Category | Equipment | Difficulty | Format | Duration |
|---|---|---|---|---|
| CALORIE BURNING | BODYWEIGHT | Intermediate (3★) | AMRAP   | 30 min |
| CALORIE BURNING | EQUIPMENT  | Intermediate (4★) | AMRAP   | 30 min |
| METABOLIC       | BODYWEIGHT | Intermediate (3★) | CIRCUIT | 30 min |
| METABOLIC       | EQUIPMENT  | Intermediate (4★) | CIRCUIT | 30 min |
| CARDIO          | BODYWEIGHT | Intermediate (3★) | EMOM    | 30 min |
| CARDIO          | EQUIPMENT  | Intermediate (4★) | EMOM    | 30 min |

All: `is_premium=true`, `is_standalone_purchase=true`, `tier_required="gold"`, `price=3.99`, `is_visible=true`, `is_workout_of_day=false`.

## Execution

1. **Invoke** `generate-category-difficulty-batch` with:
   ```json
   { "difficulty": "Intermediate",
     "categories": ["CALORIE BURNING","METABOLIC","CARDIO"],
     "equipment":  ["BODYWEIGHT","EQUIPMENT"],
     "price": 3.99, "tier_required": "gold" }
   ```
   For each job the orchestrator handles:
   - Library-first exercise selection (intermediate-tagged) with `rejectNonLibraryExercises` guard
   - 5-section structure (Soft Tissue Preparation 🧘 / Activation 🔥 / Main Workout 💪 / Finisher ⚡ / Cool Down 🧊) with bullet lists, bold+underlined section titles, `{{exercise:ID:Name}}` markup
   - Banned-name check against every existing workout (no duplicates or near-variants)
   - AI image generation via `generate-workout-image` saved to `image_url`
   - Stripe product + price creation with `project:"SMARTYGYM"`, `content_type:"Workout"` metadata, persisted to `stripe_product_id` / `stripe_price_id`
   - Description, instructions, tips populated per the master formatting standard
   - Auto serial number via the (now-resynced) category counter

   The function runs jobs sequentially with 1.5s spacing. 6 jobs is ~1–3 min; if there's any risk of hitting the 150s Edge timeout, split into 2 calls of 3 jobs each (one category per request).

2. **Post-run DB audit** on the 6 new rows: verify `image_url`, `stripe_product_id`, `stripe_price_id`, `price=3.99`, `is_premium`, `is_standalone_purchase`, `tier_required="gold"`, `difficulty="Intermediate"`, `difficulty_stars` (3 BW / 4 EQ), `format`, `duration="30 min"`, `is_visible=true`, and exercise-token counts in content.

3. **Stripe sync audit** — invoke `verify-workout-stripe-sync` (audit mode, no `?fix=1`) to confirm products/prices are EUR, one-time, active, correct metadata, and amounts match the DB. If any row reports issues, re-run with `?fix=1` and re-audit.

4. **Content quality sanity check** on each workout body:
   - 5 section headings present in order
   - Main Workout uses the declared format (AMRAP / CIRCUIT / EMOM) with measurable prescriptions before every exercise token
   - Finisher present and short; Cool Down present
   - No durations embedded inside protocol headers (per `protocol-block-formatting-standard`)
   - Description ≥ 2 sentences; Instructions explains the protocol; Tips are coaching cues, not instructions

## Notes

- No code or schema changes. Pure orchestration + verification.
- Naming uniqueness enforced both by prompt banned list and DB index — collisions auto-retry inside the function.
- HFSC is untouched.
