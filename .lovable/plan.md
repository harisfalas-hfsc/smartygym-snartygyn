Here is the finish-now plan for everything still incomplete from the WOD/Stripe hardening work.

## Goal
Lock the system so it cannot quietly create:
- active orphan Stripe products,
- WOD names with numbers/internal codes,
- partially linked paid content,
- partial WOD days where only one expected workout is live,
- fallback payment products from unsafe or client-provided data.

## What appears already done
- The WOD generator now validates names before Stripe creation.
- WOD Stripe idempotency keys are now stable by date/equipment slot.
- Stripe products are archived if the database insert or immediate verification fails.
- Database validation functions for public workout/program integrity exist in the project.
- A `cleanup-wod-stripe-orphans` backend function exists, but it is not fully integrated yet.

## What is left unfinished

### 1. Verify and finish the Stripe cleanup action
- Re-check Stripe for the known orphan product: `prod_UPQ2XCrWvpLmmC` / `Granite Ascent Protocol`.
- If it is still active, archive it.
- Re-check active WOD Stripe products after cleanup and confirm only database-linked products remain active.

### 2. Verify database triggers are actually installed
- Confirm the integrity triggers exist on:
  - `admin_workouts`
  - `admin_training_programs`
- If the trigger functions exist but the triggers are missing, add/fix the triggers with a migration.
- Confirm the database rejects future WOD names containing numbers/internal codes and rejects paid standalone records with only one payment ID.

### 3. Expand orphan cleanup so it covers all paid content safely
The current cleanup function only compares active WOD Stripe products against `admin_workouts`.

I will update it to:
- collect linked Stripe product IDs from both workouts and training programs,
- only touch SmartyGym-owned products with trusted metadata,
- support dry-run by default,
- archive with metadata explaining why it was archived,
- return a clear report of kept/archived/errors,
- avoid deleting anything.

### 4. Run cleanup automatically after WOD generation
- After a successful WOD generation/orchestration run, call the cleanup logic in safe mode for WOD products.
- If a generation attempt fails after Stripe creation, cleanup should run before the function exits.
- This prevents a failed retry from leaving active unlinked products behind.

### 5. Add a dedicated WOD payment health report
Create or extend a backend health check that reports:
- today’s expected WOD count: 2 normally, 1 on recovery days,
- expected equipment slots: BODYWEIGHT + EQUIPMENT, or VARIOUS on recovery days,
- each WOD’s database ID, name, equipment, visibility, product ID, price ID,
- whether names contain forbidden numbers/internal suffixes,
- whether any WOD is missing a product/price pair,
- whether each Stripe product is active,
- whether product metadata points back to the correct workout ID,
- whether any active WOD Stripe products are orphaned.

Result should be a simple status: `healthy`, `warning`, or `failed`.

### 6. Harden checkout so it cannot create fallback products from unsafe data
`create-individual-purchase-checkout` can still create a Stripe product/price if the database record has missing Stripe IDs.

I will change that so:
- checkout never trusts client-provided `contentName`, `price`, `stripeProductId`, or `stripePriceId`,
- checkout uses only database-validated content,
- for WOD standalone purchases, missing Stripe product/price IDs becomes a hard error instead of creating a fallback product,
- for non-WOD paid content, fallback creation only happens after strict database validation and with stable metadata/idempotency.

### 7. Strengthen name guards one final time
- Remove any remaining duplicate fallback behavior that could create awkward names.
- Keep public WOD names free of digits, internal suffixes, version markers, and AI-style debug names.
- Confirm no fallback adds `(Equipment)`, `(Bodyweight)`, numbers, or codes.

### 8. Final verification report
After implementation, run a final audit and report back with:
- whether the known orphan product is inactive,
- active WOD Stripe product count,
- today’s WOD count and expected count,
- each today WOD name and payment link status,
- orphan count,
- trigger status,
- checkout safety status.

## Technical implementation notes
- Main files to update:
  - `supabase/functions/cleanup-wod-stripe-orphans/index.ts`
  - `supabase/functions/generate-workout-of-day/index.ts`
  - `supabase/functions/wod-generation-orchestrator/index.ts`
  - `supabase/functions/create-individual-purchase-checkout/index.ts`
  - possibly `supabase/functions/run-system-health-audit/index.ts` or a new WOD-specific health function
- Database changes, if needed, will be done by migration only.
- Stripe products will be archived, never deleted.
- No workout/program content will be deleted.
- Admin checks will use server-side role validation, not browser storage.