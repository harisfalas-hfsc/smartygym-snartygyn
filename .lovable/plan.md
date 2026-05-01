I will fix this in two layers: first today’s two broken WODs, then the WOD generation system so the same mess cannot repeat.

The core change is this: there will be one WOD publish contract. No path will be allowed to publish a WOD unless it passes the same checks for periodization, structure, formatting, exercise density, images, Stripe product/price, and visual rendering.

## Immediate repair: fix today’s two WODs

1. Remove the current broken WOD state non-destructively
   - Clear `is_workout_of_day` and `generated_for_date` from the two bad library-selected rows.
   - Do not permanently delete them.
   - Keep the rows available for audit/history unless they are clearly unsuitable for normal library use.

2. Publish two clean WOD-specific replacements for today
   - Create or update today’s WODs as proper WOD rows, not messy legacy library promotions.
   - Bodyweight: replace Cadence Complex with a properly structured METABOLIC / EMOM / BODYWEIGHT WOD.
   - Equipment: replace Metabolic Surge with a properly structured METABOLIC / EMOM / EQUIPMENT WOD.
   - Enforce the required sections:
     - Soft Tissue Preparation
     - Activation
     - Main Workout
     - Finisher
     - Cool Down
   - Enforce the required public fields:
     - Description
     - Workout
     - Instructions
     - Tips
   - Clean up instructions and tips so they are written like paid coaching content, not broken fragments or misplaced exercise tags.

3. Preserve or repair payment links correctly
   - Keep the WOD price at 3.99 EUR.
   - Ensure each active WOD has exactly one active Stripe product and one default price.
   - Ensure product metadata points to the final WOD row ID.
   - Ensure the Stripe product has the same image as the website card.
   - Archive any orphaned or wrongly linked WOD Stripe products.

4. Validate the public result
   - Query the database after the repair.
   - Check the WOD page data: two WODs, correct date, visible, paid, image present, product present, price present.
   - Run the WOD payment/image audit for today.
   - Confirm the two WODs render with consistent Workout / Instructions / Tips formatting.

## Code cleanup: replace the messy recovery maze with one controlled flow

### Current problem

The WOD system currently has too many paths that can declare success:

```text
cron
  -> orchestrator
      -> generate-workout-of-day
      -> retry
      -> backup
      -> watchdog
      -> library fallback
      -> Stripe/image repair utilities
```

That creates inconsistency because each path checks a different subset of rules. One path checks sections. Another checks payment. Another checks images. Another promotes old library content. The result is exactly what happened today: the website is not empty, but the content is not premium-ready.

### New target flow

I will change the system to this:

```text
Daily cron
  -> WOD orchestrator
      -> build candidate WODs
      -> normalize all fields
      -> validate one shared WOD publish contract
      -> create/sync Stripe products
      -> publish all-or-none
      -> notify only after final success
```

Fallbacks will no longer publish directly. They will only create candidates, and those candidates must pass the same final gate.

## Refactor plan

1. Create one shared WOD integrity module
   - Add a shared backend helper, likely under `supabase/functions/_shared/wod-integrity.ts`.
   - This becomes the single source of truth for:
     - expected slots from the 84-day periodization cycle
     - required equipment: BODYWEIGHT + EQUIPMENT, or VARIOUS for recovery
     - section completeness
     - minimum exercise density
     - required fields: description, main workout, instructions, tips
     - valid image URL
     - paid standalone flags
     - Stripe product/price pair
     - Stripe default price match
     - Stripe product image match
     - forbidden public names
     - no raw/broken exercise placeholders in instructions/tips
     - no broken HTML or mixed formatting classes

2. Normalize all WOD text fields before publish
   - Reuse the existing HTML normalizer for `main_workout`.
   - Extend normalization to `description`, `instructions`, and `tips`.
   - Ensure all four user-facing content fields use consistent TipTap-style HTML.
   - Strip broken or inappropriate exercise markup from instructions/tips unless it is intentionally linked and render-safe.
   - Standardize paragraph/list spacing so the Workout, Instructions, and Tips cards look like one product.

3. Fix the frontend rendering inconsistency
   - The Workout section currently uses the exercise-aware renderer.
   - Instructions and Tips use a different generic HTML renderer.
   - I will make these render through a consistent wrapper/style system so font color, bold text, spacing, and dark/light behavior match across all workout cards.
   - I will keep the existing structure: Description, Workout, Instructions, Tips. No disruptive redesign.

4. Tighten library fallback or disable it from direct publishing
   - Library fallback will no longer be allowed to mark old rows as WOD unless they pass the full WOD integrity contract.
   - If a selected library workout has poor instructions/tips, broken HTML, missing fields, missing image, bad Stripe data, or inconsistent formatting, it will be rejected.
   - If library fallback is still used, it must either:
     - clone into a clean WOD-specific row after normalization, or
     - refuse to publish and alert.
   - It will not silently promote legacy rows as paid WODs again.

5. Remove duplicate success logic from backup/watchdog
   - Backup and watchdog should not have their own independent definition of “valid WOD.”
   - They will call the shared validator, not their own partial checks.
   - Their job becomes monitoring and recovery, not publishing with weaker rules.

6. Stop function-to-function chaos where possible
   - The current system has backend functions calling other backend functions repeatedly.
   - I will move shared logic into shared modules/direct database operations where practical.
   - The orchestrator should coordinate, not bounce through multiple HTTP calls with different assumptions.

7. Enforce all-or-none publishing
   - On normal training days, both BODYWEIGHT and EQUIPMENT must pass before either becomes public.
   - On recovery days, the VARIOUS recovery WOD must pass fully.
   - If one slot fails, the whole date fails closed and sends an admin alert.
   - No half-day, no one-card WOD, no ugly fallback WOD.

8. Stripe and image contract
   - Before publishing, every paid WOD must have:
     - active Stripe product
     - active price
     - product default price matching DB `stripe_price_id`
     - DB `stripe_product_id` matching Stripe metadata
     - product image matching website `image_url`
   - Any orphan product created during a failed publish will be archived.

9. Add a single WOD health report that checks everything
   - Extend the existing WOD health report so it checks not only payment, but also:
     - periodization match
     - active row count
     - full content fields
     - section validation
     - exercise density
     - image presence
     - Stripe product image/default price
     - formatting compliance
   - This becomes the post-generation truth check.

10. Clean admin/manual controls
   - Admin WOD generation buttons should use the same orchestrator/publish contract.
   - No manual action should bypass validation unless explicitly marked as draft/hidden.
   - Admin-facing status should show exactly why a WOD failed: formatting, missing image, missing price, periodization mismatch, etc.

## Acceptance criteria

I will consider this fixed only when all of the following are true:

1. Today’s WOD page shows two professional WODs with clean Workout, Instructions, and Tips.
2. Both today’s WODs have valid images on the website and matching images on the Stripe products.
3. Both today’s WODs have valid 3.99 EUR Stripe prices and default prices set.
4. The WOD health report returns healthy for today.
5. Backup/watchdog/orchestrator all use the same validation rules.
6. Library fallback cannot publish old messy content directly.
7. A partial or ugly WOD fails closed instead of appearing publicly.
8. Future generation logs show one clear flow: build, normalize, validate, Stripe sync, publish.

## Implementation order

1. Repair today’s two WODs first.
2. Build the shared WOD integrity validator.
3. Wire orchestrator, generator, backup, watchdog, and library fallback to that validator.
4. Normalize frontend rendering for Workout / Instructions / Tips.
5. Harden Stripe/image synchronization.
6. Run live validation and report the exact status back to you.

This is the plan I will implement after approval.