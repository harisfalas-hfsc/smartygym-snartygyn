# Generate 10 Premium Advanced Workouts (with Stripe products)

Mirror exactly what was done for the 10 free workouts, but flipped to **Premium / Standalone Purchase / Advanced** with full Stripe wiring.

## Scope

5 categories × 2 variants = **10 new workouts**:

| Category | Bodyweight | Equipment |
|---|---|---|
| Strength | 1 | 1 |
| Calorie Burning | 1 | 1 |
| Metabolic | 1 | 1 |
| Cardio | 1 | 1 |
| Mobility & Stability | 1 | 1 |

All Advanced (`difficulty = 'Advanced'`, `difficulty_stars = 5 or 6`).

## Part A — Generator (reuse with premium mode)

Add a `mode: "premium"` branch to `supabase/functions/generate-free-category-workouts/index.ts` (or fork into `generate-premium-category-workouts`) that:

1. Forces `difficulty = 'Advanced'`, `difficulty_stars = 6`, intensity/volume tuned for advanced trainees.
2. Sets DB flags:
   - `is_free = false`
   - `is_premium = true`
   - `tier_required = 'gold'` (matches existing premium content)
   - `is_visible = true`
   - `is_standalone_purchase = true`
   - `price = 4.99` (standard standalone workout price — confirm if you want a different number)
3. Generates content with the same hard rules already enforced for the free batch:
   - 5-section structure inside `<div class="workout-content">` (Soft Tissue, Activation, Main, Finisher, Cool Down)
   - Library-first `{{exercise:ID:Name}}` markup only
   - Density minimums per section
   - Reps / sets / tempo / rest on every exercise line
   - Category-specific format: Strength + Mobility & Stability → REPS & SETS; Cardio / Metabolic / Calorie Burning → rotate EMOM / AMRAP / Tabata / Circuit
   - Bodyweight variant: zero machines/equipment; Equipment variant: studio/standard equipment, no machines in HIIT/Tabata
   - Unique human-friendly name (no AI/debug suffixes — passes `validate_public_workout_integrity`)
   - Triggers auto image generation (existing `trigger_auto_generate_workout_image` runs because `image_url` is NULL)

## Part B — Stripe products (one per workout, 10 total)

For each generated workout, call the existing `create-stripe-product` edge function with:

- `name`: workout name
- `price`: 4.99
- `contentType`: `"Workout"`
- `imageUrl`: the workout's generated `image_url` (wait until image generation completes; if still pending after a short retry window, create the Stripe product without image and run `update-stripe-product-image` once the image lands)

This guarantees the **mandatory metadata**:
```
project: "SMARTYGYM"
content_type: "Workout"
```
(per `.note/stripe-metadata-rule.md` — no direct Stripe API calls, only the project's edge functions).

Then update each `admin_workouts` row with the returned `stripe_product_id` and `stripe_price_id`. This satisfies `validate_public_workout_integrity` (both must be set together for a paid standalone workout).

## Part C — QA pass (same checklist as the free batch)

For each of the 10 workouts verify:

1. 5-section structure + `workout-content` wrapper present.
2. Exercise density meets minimums.
3. Every exercise uses library-first markup, no invented exercises, no plain-text names.
4. Every exercise line has reps / sets / tempo / rest.
5. Correct category-specific format applied.
6. Bodyweight = no equipment; Equipment = no banned machines in HIIT/Tabata.
7. Unique name (DB unique check) + unique loaded `image_url`.
8. Premium flags correct: `is_premium=true`, `is_free=false`, `is_visible=true`, `is_standalone_purchase=true`, `price=4.99`, `tier_required='gold'`, both `stripe_product_id` and `stripe_price_id` set and linked to a real Stripe product carrying SMARTYGYM metadata.
9. Tone: human-designed voice, aligned with the Smarty Method philosophy, no "AI coach" phrasing.
10. Premium gating works: anonymous + free users see "Buy / Upgrade", premium users see "Included in Premium" (no purchase button), per existing `PurchaseButton` + `create-individual-purchase-checkout` rules.

Report a final pass/fail table for all 10 workouts with their ids, names, Stripe product ids, and any fixes applied.

## Confirmations needed

1. **Price per workout = €4.99** (matches existing standalone micro-workouts). Want a different price?
2. **`tier_required = 'gold'`** for all 10 (so Gold + Platinum subscribers get them included). OK?

If both are OK, no further questions — I'll execute Parts A → B → C end-to-end.
