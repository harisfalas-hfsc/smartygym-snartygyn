You are right: the system must not create public products that are unlinked, badly named, or confusing. I checked the current state and the actual code path.

Current status from the audit
- Today’s WOD database state is healthy:
  - Core Tempo Circuit [BODYWEIGHT] is linked to Stripe product `prod_UPQ2ckz0m0gSpd` and a price.
  - Granite Descent Challenge [EQUIPMENT] is linked to Stripe product `prod_UPQ32ncD6SRpzq` and a price.
  - Current WOD count is 2, which is correct for a normal non-recovery day.
  - No workout records are missing a price/product pair in the database.
  - No duplicated Stripe product IDs are linked in the database.
- Stripe catalog state is not fully clean:
  - `Granite Ascent Protocol` / `prod_UPQ2XCrWvpLmmC` is active in Stripe but is not linked to any workout record.
  - It has no default price, so it appears to be a failed/leftover product from a generation attempt.
- Code issue found:
  - The WOD function creates the Stripe product and price before inserting the workout record. It has a rollback, but if a later failure path happens after Stripe creation or a retry creates a different payload, an orphan can still remain.
  - The idempotency key is not truly stable because it hashes a payload that includes variable fields like generated workout ID/name/image. That can create a different Stripe product during retries for the same date/equipment.
  - Name cleanup exists, but it still allows some confusing generated names and the final duplicate guard can append “(Equipment)” / “(Bodyweight)”, which should not be used as public product naming.

Plan to fix and prevent this class of errors

1. Immediate cleanup
- Archive the orphan Stripe product `prod_UPQ2XCrWvpLmmC` (`Granite Ascent Protocol`) so it no longer appears as an active product.
- Re-check the Stripe catalog after archiving and confirm today’s two WOD products remain active and correctly linked.

2. Make Stripe creation truly idempotent
- Change the WOD Stripe idempotency key to be based only on stable slot identity:
  - `SMARTYGYM:wod:{generated_for_date}:{equipment}:product`
  - `SMARTYGYM:wod:{generated_for_date}:{equipment}:price`
- Do not include generated name, image URL, timestamp ID, or full payload in the idempotency key.
- This means retries for the same date/equipment cannot create a second product just because the AI generated a different name on retry.

3. Move validation before Stripe creation
- Enforce all hard gates before any Stripe product is created:
  - final public name validation
  - no numeric/internal suffixes
  - no duplicate name
  - section completeness
  - minimum exercise density
  - exercise-library linking/rejection
  - image generation/validation policy
- Stripe creation should happen only after the workout content is fully accepted.

4. Strengthen the public name rules
- Replace the current loose name cleaner with a strict public-name validator:
  - Reject names containing digits anywhere unless explicitly allowed by a small whitelist.
  - Reject internal suffixes like `0427BW`, `0418EQ`, `v2`, `#3`, etc.
  - Reject awkward AI-style protocol names if they are not aligned with the brand naming standard.
  - Reject duplicate names across the full workout library and across the same generation run.
- Remove the fallback behavior that appends `(Equipment)` or `(Bodyweight)` to a duplicate public name.
- Use clean professional fallback names instead, e.g. `Core Tempo Circuit`, `Loaded Challenge Session`, `Bodyweight Strength Builder`, etc.

5. Add a post-creation Stripe association verification gate
- Immediately after Stripe product/price creation and database update/insert, verify:
  - the database workout exists
  - `stripe_product_id` matches the created Stripe product
  - `stripe_price_id` exists
  - Stripe product metadata `content_id` matches the workout ID
  - Stripe product name matches the final database workout name
  - product is active
- If any check fails, archive the Stripe product immediately and mark the workout invisible/non-WOD if needed.

6. Add automatic orphan reconciliation
- Add or repair a backend function dedicated to Stripe WOD hygiene:
  - List recent active SmartyGym WOD Stripe products.
  - Compare them against `admin_workouts.stripe_product_id` and `admin_training_programs.stripe_product_id`.
  - Archive any active Stripe product not linked in the database.
  - Report exactly what it archived and what it left untouched.
- Run this after WOD generation and from watchdog checks, so orphans are cleaned automatically instead of waiting for manual discovery.

7. Add a WOD health report function
- Create an admin-only health check that reports:
  - today’s expected WOD count
  - whether BODYWEIGHT and EQUIPMENT exist, or VARIOUS on recovery days
  - whether each WOD has product and price IDs
  - whether each Stripe product exists, is active, and has a price
  - whether any active Stripe products are orphaned
  - whether names contain numbers/internal suffixes
  - whether final WOD section validation passes
- This gives a clear “healthy / warning / failed” result instead of hidden failures.

8. Add database-level safety rails where appropriate
- Add non-destructive constraints/triggers for future WOD inserts/updates:
  - Prevent `is_workout_of_day = true` records with numeric/internal-coded public names.
  - Prevent WOD standalone purchase records from having only one of `stripe_product_id` / `stripe_price_id` when both are required.
  - Use validation triggers rather than time-based check constraints.
- Keep this non-destructive and compatible with existing records.

9. Update monitoring and failure handling
- Make generation failures explicit:
  - if a variant fails after Stripe creation, archive created Stripe artifacts immediately
  - if only one WOD variant succeeds on a normal day, rollback partial publishing and archive unlinked Stripe products
  - log the exact failed step in `notification_audit_log`
- Update admin alert wording to include payment association health, not just generation success.

10. Verify after implementation
- Run the WOD health check for today.
- Confirm the active Stripe catalog has no unlinked WOD products.
- Confirm today’s two WODs are visible, linked, purchasable, and correctly named.
- Confirm no new names contain internal numbers/codes.

Technical notes
- Main code to harden: `supabase/functions/generate-workout-of-day/index.ts`.
- Related checkout safety path: `supabase/functions/create-individual-purchase-checkout/index.ts` should also stop creating fallback Stripe products from client-provided names and only use validated database content.
- A cleanup/health function should be implemented as a backend function with in-code admin validation and safe, parameterized database calls.
- No destructive workout deletion is needed. Stripe cleanup should archive products, not delete them.