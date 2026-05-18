
## Goal

Create **24 new premium Strength workouts** in the library, all standalone-purchasable, each with a unique image synced to Stripe, and verify each one before reporting done.

## Matrix (6 focuses × 4 variants = 24)

Focuses: LOWER BODY, UPPER BODY, FULL BODY, LOW PUSH & UPPER PULL, LOW PULL & UPPER PUSH, CORE & GLUTES

For each focus:
- Advanced Bodyweight — 5★
- Advanced Equipment — 6★
- Intermediate Bodyweight — 3★
- Intermediate Equipment — 4★

All: `category = STRENGTH`, `format = REPS & SETS`, `is_premium = true`, `is_standalone_purchase = true`, `price = 3.99 EUR`, `is_visible = true`, `is_workout_of_day = false`, `wod_source = manual-batch`.

## Pipeline (per workout)

Reuse the existing `generate-workout-of-day` shared modules so every standard is enforced automatically. New thin orchestrator edge function `generate-strength-batch` will:

1. **Generate content** via the same `_shared/wod` builders used by the WOD cron (library-first exercise selection, 5-section structure, protocol sanitizer, density validator, naming cleaner from `_shared/wod/naming.ts`, quality gate from `_shared/wod-quality-gate.ts`).
   - Force `category=STRENGTH`, fixed `format=REPS & SETS`, the requested focus, equipment, and star rating.
   - Reps/sets/tempo/rest mandatory per `reps-sets-formatting-standard`.
   - Bullet-list formatting, bold+underlined section headers, empty `<p>` separators, `{{exercise:ID:Name}}` tokens only.
2. **Clean name** through `cleanPublicWorkoutName` — short, human, no "Axial Current / Matrix / Protocol / Helix" garbage, no internal codes, uniqueness checked against existing `admin_workouts.name`.
3. **Insert** row into `admin_workouts` with all premium + standalone flags set.
4. **Generate unique image** via `generate-workout-image` (per-workout prompt seeded by name+focus+equipment). Save `image_url`.
5. **Create Stripe product + price** via `create-stripe-product` with required metadata (`project=SMARTYGYM`, `content_type=Workout`, `workout_id`, `focus`, `equipment`, `difficulty_stars`), attach the generated image URL to the Stripe product, and store `stripe_product_id` + `stripe_price_id` on the row.
6. **Quality gate**: re-run `applyWodQualityGate` on saved content; if fail → delete row + Stripe product, retry up to 3×.

## Verification (mandatory before saying "done")

Per-workout checklist, all must pass:

| Check | Source |
|---|---|
| Row exists in `admin_workouts` with correct category/focus/equipment/stars | DB |
| `is_premium=true`, `is_standalone_purchase=true`, `price=3.99` | DB |
| `image_url` set and reachable (HTTP 200) | Storage |
| Name passes `hasInternalNameCode` + `hasAiStyleName` = false, unique | DB |
| `warm_up`, `main_workout`, `cool_down`, `instructions`, `tips`, `description` all present and formatted | DB |
| `main_workout` contains only library `{{exercise:ID:Name}}` tokens | DB + exercises table |
| Quality gate passes (duration min, finisher structure, per-line prescription) | `wod-quality-gate.ts` |
| `stripe_product_id` + `stripe_price_id` set | DB |
| Stripe product exists, active, has image, metadata correct, price = 399 EUR | Stripe API |
| Appears under Strength category + correct focus filter on public site | Live query |

A final verification edge function `verify-strength-batch` runs all 10 checks for each of the 24 IDs and returns a row-by-row pass/fail table. Only after **24/24 fully green** will I list the 24 names back to you as confirmation.

## Deliverables

1. New edge function `generate-strength-batch` (orchestrator, reuses shared modules).
2. New edge function `verify-strength-batch` (10-point audit).
3. Admin trigger button in `WorkoutsManager.tsx` → "Generate Strength Library Batch (24)".
4. After successful run: chat reply listing all 24 final names grouped by focus, each marked ✅ with its Stripe product ID.

## Technical notes

- All generation reuses `_shared/wod/*` and `_shared/protocol-sanitizer.ts` — zero duplication.
- Naming uses `cleanPublicWorkoutName` fallback pool ("Loaded Strength Session", "Bodyweight Strength Builder", etc.) with focus suffix only if needed for uniqueness. Never AI-style words.
- Image prompts: human, gym-realistic, varied (no two prompts identical), brand colors per memory.
- If any of the 24 fails verification after 3 retries, I stop and report exactly which ones failed and why — I will not claim success.

Run as background job (sequential, ~24 × ~30s = ~12 min) to stay under Edge Function timeout per item.
