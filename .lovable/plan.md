## Goal

Generate **12 new premium STRENGTH workouts** following the exact same pattern as the most recent batch (`PREM-STR-*-adv-1779072*`).

## Matrix (12 workouts)

| # | Focus | Equipment |
|---|---|---|
| 1-2 | LOWER BODY | BODYWEIGHT, EQUIPMENT |
| 3-4 | UPPER BODY | BODYWEIGHT, EQUIPMENT |
| 5-6 | FULL BODY | BODYWEIGHT, EQUIPMENT |
| 7-8 | LOW PUSH & UPPER PULL | BODYWEIGHT, EQUIPMENT |
| 9-10 | LOW PULL & UPPER PUSH | BODYWEIGHT, EQUIPMENT |
| 11-12 | CORE & GLUTES | BODYWEIGHT, EQUIPMENT |

## Fixed attributes (all 12)

- `category = STRENGTH`
- `difficulty = Advanced`, `difficulty_stars = 5`
- `is_premium = true`, `tier_required = gold`
- `is_standalone_purchase = true`, `price = 3.99`, `is_free = false`, `is_visible = true`
- `format = REPS & SETS`, `duration = 45 min`
- Unique, evocative name (no numbers, no internal suffixes — validation trigger enforces this)
- Unique `id` of form `PREM-STR-<focus-slug>-<B|E>-adv-<timestamp>`

## Content (standardized format)

Each workout follows the gold-standard 5-section structure with mandatory icons + `<strong><u>` headers + bullet lists + empty paragraphs between sections:

1. 🧽 **Soft Tissue Preparation 5'** — foam rolling block
2. 🔥 **Activation** — bullet list, library exercises via `{{exercise:ID:Name}}` markup
3. 💪 **Main Workout** — 4–6 strength exercises with reps × sets, rest, tempo; library tokens only
4. ⚡ **Finisher** — short metabolic or AMRAP block (every line has measurable dose before token)
5. 🧘 **Cool Down 5'** — stretches

Plus filled `instructions`, `tips`, `notes`, `description`. All exercises pulled from `exercise_library` (verified by ID lookup before insert). Bodyweight variants: no machines/dumbbells/barbells. Equipment variants: gym tools allowed.

## Pipeline (step-by-step)

1. **Pull library snapshot** — query `exercise_library` filtered by primary muscle groups matching each focus; cache IDs + names so every `{{exercise:ID:Name}}` token is verified.
2. **Generate 12 unique images** via `imagegen--generate_image` (premium tier, JPG, 1024×1024), saved to `/tmp/` then uploaded to `workout-images` Supabase Storage bucket → public URL.
3. **Create Stripe products** via `create-stripe-product` edge function (auto-tags `project: SMARTYGYM`, `content_type: Workout`, attaches image URL).
4. **Insert into `admin_workouts`** with all fields including `image_url`, `stripe_product_id`, `stripe_price_id`. Triggers will auto-queue notifications + IndexNow.
5. **QA verification** (before reporting done):
   - SQL audit: confirm 12 rows, all `is_premium=true`, all have `stripe_product_id`, `image_url`, all 5 sections non-empty, every exercise ID exists in `exercise_library`.
   - Stripe audit: fetch each product, verify metadata + image present.
   - Visual check: render 1 sample workout in preview and screenshot it, verify the 👁 eye icon (exercise modal trigger) appears next to exercise tokens, formatting is correct, premium gate works.
6. **Report**: table of 12 workouts (name, focus, equipment, ID, Stripe product ID, image URL) + QA results.

## Out of scope

No layout/UI changes, no schema migrations, no changes to existing workouts.

## Approve to proceed

On approval, I switch to build mode and execute steps 1–6 in order, with the QA report as the final deliverable.
