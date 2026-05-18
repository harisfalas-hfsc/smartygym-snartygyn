## Goal

Create 24 new premium Strength workouts and only confirm completion after a per-workout verification pass.

Breakdown — 1 BODYWEIGHT + 1 EQUIPMENT for each focus, at both Advanced and Intermediate:

- 6 focuses: LOWER BODY, UPPER BODY, FULL BODY, LOW PUSH & UPPER PULL, LOW PULL & UPPER PUSH, CORE & GLUTES
- 6 × 2 equipment × 2 difficulties = **24 workouts**
- Stars: BW Advanced = 5★, EQ Advanced = 6★, BW Intermediate = 3★, EQ Intermediate = 4★

## How it will be built

We already have `supabase/functions/generate-strength-focus-batch` purpose-built for exactly this matrix. It enforces every standard you listed:

- Library-first `{{exercise:ID:Name}}` markup with non-library rejection
- 5-section format + density validation + HTML normalizer (bullets, bolds, spacing)
- Focus-specific exercise guidance (e.g. LOW PUSH & UPPER PULL excludes hinge/press)
- Difficulty-aware reps/sets
- Sets `category=STRENGTH`, `format=REPS & SETS`, `duration=30 min`, `is_premium=true`, `is_standalone_purchase=true`, `is_visible=true`
- Auto-generates a unique AI workout image
- Creates a Stripe product + price with required `project=SMARTYGYM`, `content_type=Workout` metadata and writes `stripe_product_id` / `stripe_price_id` back to the workout

The orchestrator will be invoked once with the full 24-job matrix. It runs sequentially with rate-limit-safe pacing.

## Verification pass (mandatory before saying "done")

After generation, run a verification script that loops over the 24 created workouts and checks each one:

1. **DB row exists** in `admin_workouts` with: `category=STRENGTH`, correct `focus`, correct `equipment`, correct `difficulty` + `difficulty_stars`, `is_premium=true`, `is_standalone_purchase=true`, `price>0`, `is_visible=true`, `image_url` populated, `stripe_product_id` + `stripe_price_id` populated.
2. **Content quality**: passes `validateWodSections` (5 sections), passes HTML normalizer, has non-empty `description`, `instructions`, `tips`, and exercise markup density above threshold.
3. **Image**: `image_url` resolves (HEAD 200) and is a unique URL (no duplicates across the 24).
4. **Stripe**: fetch the product by `stripe_product_id` and confirm:
   - `metadata.project === "SMARTYGYM"` and `metadata.content_type === "Workout"`
   - product `images[0]` matches the workout `image_url`
   - linked price matches `stripe_price_id`, currency EUR, amount > 0, one-time
5. **Category page**: workout appears in the STRENGTH category query (`get_visible_workout_metadata` + focus filter).

Any failure on any of the 24 → I fix it (re-run that specific job or repair the missing piece) and re-verify. Only after all 24 pass every check do I report back with a confirmation list of all 24 names grouped by focus / equipment / difficulty.

## Risk / scope notes

- No UI changes. No schema changes. No edits to existing workouts.
- Only new rows in `admin_workouts` + new Stripe products/prices, all tagged SMARTYGYM.
- Generation of 24 workouts + images + Stripe products realistically takes several minutes; I'll batch-invoke and poll.

## Deliverable when you approve

Per-workout confirmation table, e.g.:

```
LOWER BODY · BW · Advanced (5★)  — <name>  ✅ DB ✅ Content ✅ Image ✅ Stripe ✅ Category
LOWER BODY · EQ · Advanced (6★)  — <name>  ✅ ...
... (24 rows)
```

Only delivered after every row is fully green.