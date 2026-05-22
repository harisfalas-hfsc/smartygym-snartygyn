# WOD reliability and cleanup repair

## What is wrong right now

- The backend is healthy. The failure is inside the WOD generation pipeline.
- The manual generation created one staged WOD row: **Loaded Movement Flow**.
- That row is now hidden (`is_visible = false`) and not a current WOD (`is_workout_of_day = false`), so the public View page returns **Workout not found**.
- The Stripe product still exists because the database row still contains `stripe_product_id`, so the orphan cleanup correctly treats it as “linked” and keeps it active.
- The equipment WOD failed because the quality gate rejected the AI output: the finisher was labeled **FOR TIME** but had no rounds/time cap/ladder.
- The admin “Delete” button is intentionally archiving paid/Stripe-linked workouts instead of deleting them, but that behavior is wrong for failed hidden WODs because it leaves unusable hidden rows and active Stripe products.

## Fixes to implement

### 1. Failed hidden WOD cleanup
Create a safe admin cleanup path for failed hidden WODs:

- If a workout is hidden, starts with `WOD-`, has no purchases, and is not an active WOD:
  - archive/deactivate the Stripe product
  - clear Stripe IDs or permanently remove the failed row
  - show a clear success message
- Keep the non-destructive rule for real paid content with customer purchases.

### 2. Admin UI clarity
Update the workout manager so the actions are not misleading:

- Hidden failed WODs show **Delete failed WOD** instead of silently “Archive to Gallery”.
- Archived WODs remain visible in the admin list via the existing WOD/source and hidden filters.
- The View button should not open the public page for hidden WODs; it should either be disabled or open the admin edit view.

### 3. Stripe cleanup correctness
Adjust WOD Stripe cleanup so failed hidden WODs do not keep Stripe products alive forever:

- Treat hidden, non-current, no-purchase WOD rows as cleanup candidates.
- Deactivate their Stripe products during cleanup.
- Preserve active/purchased products safely.

### 4. Generation reliability fix
Fix the generator/quality-gate mismatch that caused today’s repeated failures:

- Strength, Mobility, and Pilates WODs must stay **REPS & SETS** for both Main and Finisher.
- The repair logic must not rewrite a Strength finisher into **FOR TIME**.
- If the quality gate rejects an output, store the exact rejection reason in the run log so the admin panel shows the real cause, not just “missing”.

## What I will not do

- I will not generate a new Workout of the Day during this fix.
- I will not delete purchased customer content.
- I will not touch HFSC-related assets or data.

## Verification

- Confirm **Loaded Movement Flow** can be cleaned without leaving an active Stripe product.
- Confirm hidden failed WODs no longer open to a public 404.
- Confirm future failed generations record the exact quality-gate or upstream error.
- Confirm normal paid workouts with purchases are still protected from permanent deletion.
