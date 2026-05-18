
## Goal

Create **24 new premium Strength workouts** (6 focuses × 4 variants), all standalone-purchasable at €3.99, each with a unique image synced to Stripe with SMARTYGYM metadata, and verify **every single one** before reporting done.

## What changed vs the previous attempt

The previous run failed because:
1. The AI model I used returned malformed JSON / missing `{{exercise:ID:Name}}` tokens, so the pipeline correctly rejected the workouts.
2. I switched models (`gemini-2.5-pro` → `gemini-2.5-flash`) **without your approval**. That will not happen again.

This revised plan locks the model choice to your decision and adds a mandatory 1-workout smoke test before the full batch.

## Decision I need from you (model choice)

Pick ONE — I will not change it without asking:
- **A. `google/gemini-2.5-pro`** — highest quality, slower, was the model that previously returned malformed JSON in this pipeline.
- **B. `google/gemini-2.5-flash`** — faster, more reliable JSON adherence in our WOD pipeline, slightly less nuance.
- **C. `openai/gpt-5`** — strongest instruction-following for strict JSON + token formats, more expensive.

(Recommendation: **C** for this batch — strictest token/structure compliance, which is exactly where we failed.)

## Matrix (6 focuses × 4 variants = 24)

Focuses: LOWER BODY, UPPER BODY, FULL BODY, LOW PUSH & UPPER PULL, LOW PULL & UPPER PUSH, CORE & GLUTES

Per focus:
- Advanced Bodyweight — 5★
- Advanced Equipment — 6★
- Intermediate Bodyweight — 3★
- Intermediate Equipment — 4★

All rows: `category=STRENGTH`, `format=REPS & SETS`, `is_premium=true`, `is_standalone_purchase=true`, `price=3.99` EUR, `is_visible=true`, `is_workout_of_day=false`, `wod_source=manual-batch`.

## Pipeline (per workout) — reuses existing shared modules

1. **Generate** via the chosen model with strict `response_format: json_object`, using the same `_shared/wod/*` builders, library-first exercise tokens, REPS & SETS standard (reps/sets/tempo/rest mandatory), 5-section structure, bullet/bold/spacing rules.
2. **Clean name** via `cleanPublicWorkoutName` — short, human, no "Axial/Matrix/Protocol/Helix/Current", no internal codes, unique against `admin_workouts.name`.
3. **Sanitize** with `protocol-sanitizer` + `validateProtocolBlocks`.
4. **Quality gate** with `applyWodQualityGate` (duration min, per-line measurable prescription, finisher structure).
5. **Insert** row into `admin_workouts` with all flags.
6. **Generate unique image** via `generate-workout-image` (per-workout prompt).
7. **Create Stripe product + price** via `create-stripe-product` with required metadata (`project=SMARTYGYM`, `content_type=Workout`, `workout_id`, `focus`, `equipment`, `difficulty_stars`), attach image, store `stripe_product_id` + `stripe_price_id`.
8. **Retry** up to 3× on any failure; on final failure, delete row + Stripe product and mark queue row `failed` with reason.

## Mandatory smoke test BEFORE full batch

Run 1 spec end-to-end (Intermediate Bodyweight, LOWER BODY) and show you:
- final name
- 5-section content preview
- image URL
- Stripe product ID + metadata

Only after you approve the smoke result do I unpause the queue for the remaining 23.

## Verification (10-point audit, must be 24/24 green)

Existing `verify-strength-library-batch` runs per item:

| # | Check |
|---|---|
| 1 | Queue status = completed |
| 2 | `admin_workouts` row exists |
| 3 | category/focus/equipment/stars match spec |
| 4 | `is_premium=true`, `is_standalone_purchase=true`, `price=3.99` |
| 5 | `image_url` is https + reachable |
| 6 | Name passes `hasInternalNameCode` + `hasAiStyleName` = false, unique |
| 7 | All 5 content fields present + valid section structure |
| 8 | `validateProtocolBlocks` = 0 violations |
| 9 | `applyWodQualityGate` passes |
| 10 | `stripe_product_id` + `stripe_price_id` set; Stripe product active, has image, metadata `project=SMARTYGYM` + `content_type=Workout`, price = 399 EUR |

If any item fails after 3 retries, I **stop, report which ones and why, and do not claim success**.

## Deliverable on success

Chat reply listing all 24 final workout names grouped by focus, each line:
`✅ <Name> — workout_id=<id> — stripe_product=<prod_…>`

Only sent after `verify-strength-library-batch` returns `all_green: true` with `passed: 24`.

## What I need from you now

1. Pick the model (A / B / C above).
2. Confirm "yes, run the 1-workout smoke test first" before I unpause the queue.
