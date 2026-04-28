I checked the live backend state and Stripe state. Here is what is actually wrong:

1. There is no active Workout of the Day row for today, 2026-04-28.
   - Today should be a STRENGTH day.
   - Expected: 2 WODs: BODYWEIGHT + EQUIPMENT.
   - Found as active WODs: 0.

2. The generator did create two workouts, but they were left unpublished/hidden in the database:
   - BODYWEIGHT: Leg Anchor Pull
   - EQUIPMENT: Squat Row Hybrid
   - Both have full workout content and all required WOD sections.
   - Both are currently `is_visible = false`, `is_workout_of_day = false`, and `generated_for_date = null`, so the website cannot show them as today’s WOD.

3. Stripe products/prices do exist for those two generated WODs.
   - Leg Anchor Pull: product exists, price exists at €3.99.
   - Squat Row Hybrid: product exists, price exists at €3.99.
   - They are active products, but their Stripe `default_price` is not set, even though prices were created. That should be fixed so the Stripe association is complete and reliable.

4. The scheduled jobs did fire, but the final WOD publish state failed.
   - The scheduled WOD generation job ran at 22:30 UTC.
   - The backup job ran at 01:00 UTC.
   - The watchdog job ran at 01:05 UTC.
   - The run log shows today’s generation stuck/running and later auto-closed as failed with 0 active WODs.
   - No WOD notification was sent today; only the daily ritual notification went out.

Plan to fix it:

1. Immediately restore today’s Workout of the Day
   - Update the two hidden generated workouts so they become today’s active WODs:
     - set `is_workout_of_day = true`
     - set `is_visible = true`
     - set `generated_for_date = '2026-04-28'`
   - Keep the existing workout content, names, categories, and price links intact.
   - Do not delete anything.

2. Complete the Stripe product association
   - Set each Stripe product’s default price to its matching €3.99 price:
     - Leg Anchor Pull -> `price_1TQxhKIxQYg9inGKgW7igRQ2`
     - Squat Row Hybrid -> `price_1TQxgAIxQYg9inGKAP5TODtQ`
   - Confirm both products remain active and linked to the database records.

3. Patch the WOD generator so this does not repeat
   - In `generate-workout-of-day`, after creating a Stripe price, immediately update the Stripe product with `default_price = stripePrice.id`.
   - This prevents future generated WOD products from having a missing default price.
   - Keep the non-destructive rollback behavior, but improve the publish/verification flow so valid rows that already have complete content and payment IDs are not left hidden without a clear failure record.

4. Improve the health/audit reporting
   - Add clearer failure logging when WOD rows are generated but then hidden/rolled back.
   - Make the health report flag this exact case: “generated but not active/published.”
   - Include Stripe default-price status in the health report, not only product/price ID presence.

5. Validate after the repair
   - Query today’s WOD rows and confirm exactly 2 active visible WODs for 2026-04-28.
   - Confirm the WOD page can load today’s BODYWEIGHT and EQUIPMENT options.
   - Confirm Stripe products have active prices and default prices set.
   - Confirm the WOD generation run status is no longer misleading for today.

Technical details:
- Existing hidden rows to restore:
  - `WOD-S-B-1777329115122` / Leg Anchor Pull / BODYWEIGHT
  - `WOD-S-E-1777329003166` / Squat Row Hybrid / EQUIPMENT
- Existing Stripe products/prices:
  - `prod_UPnHgrcKiw9pfJ` / `price_1TQxhKIxQYg9inGKgW7igRQ2`
  - `prod_UPnGP6hUhoUAcE` / `price_1TQxgAIxQYg9inGKAP5TODtQ`
- Main files to patch:
  - `supabase/functions/generate-workout-of-day/index.ts`
  - `supabase/functions/wod-payment-health-report/index.ts`
- Database action needed:
  - Non-destructive update of the two already-created WOD rows so they publish for today.
