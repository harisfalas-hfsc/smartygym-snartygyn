
Problem

You are seeing multiple Stripe workout products because the WOD Stripe flow is not clean enough when generation is retried or regenerated. The current code can leave extra Stripe products behind.

What I found

- In `supabase/functions/generate-workout-of-day/index.ts`, every WOD generation creates a brand-new Stripe product with `stripe.products.create(...)`.
- The “idempotency” key is not truly idempotent because it includes `timestamp`:
  `wod:${effectiveDate}:${equipment}:${timestamp}`
  That means a retry/regeneration creates a new Stripe product instead of reusing the same generation slot.
- The exact string `Apex current` does not exist in the current codebase, so those products look like old/stale Stripe data from earlier bad runs or older naming logic, not the intended current WOD naming.
- Based on the last repaired WOD state in this conversation, the intended current pair is:
  - `Circuit Cascade`
  - `Apex Protocol`
- The real source of truth is not the Stripe dashboard list. The real source of truth is:
  `admin_workouts.stripe_product_id`
  for the currently live WOD rows.

Which one is right vs wrong

- Right: the Stripe products currently linked from the live WOD rows in `admin_workouts`.
- Wrong/stale: any extra Stripe products with similar WOD names that are not linked by the current database rows.
- So `Apex Protocol` and `Circuit Cascade` are the likely correct current ones, and the repeated `Apex current` entries are likely stale leftovers unless one of them is the product ID currently linked in the database.

Implementation plan

1. Audit the live mapping first
- Read today’s live WOD rows from the database.
- Read their `stripe_product_id` and `stripe_price_id`.
- Cross-check those exact IDs against the Stripe products you are seeing.
- Mark one canonical product per live WOD row.

2. Clean up the stale Stripe products safely
- Archive only the extra WOD Stripe products that are not linked from the current database rows.
- Do not delete anything destructively.
- Preserve purchase history and leave canonical linked products untouched.

3. Fix the generator so this stops happening
- In `generate-workout-of-day/index.ts`, replace the timestamp-based Stripe idempotency key with a stable generation key per date/equipment.
- Before creating a new WOD Stripe product, check whether a canonical product already exists for that same generation slot and reuse/update it when appropriate.
- If Stripe product creation succeeds but the database insert fails, immediately archive that just-created Stripe product so it cannot remain orphaned.

4. Add a duplicate/orphan guard
- Add a dedicated WOD Stripe cleanup path that can detect:
  - active Stripe WOD products not referenced by any workout row
  - duplicate active products for the same WOD date/equipment
- This can be a small admin cleanup action so the issue can be audited quickly if it ever happens again.

Technical details

Files to update:
- `supabase/functions/generate-workout-of-day/index.ts`
- likely one dedicated cleanup/audit edge function for stale WOD Stripe products
- optionally `src/components/admin/SettingsManager.tsx` for a one-click admin cleanup trigger

Key fixes:
- Change unstable key:
  `wod:${effectiveDate}:${equipment}:${timestamp}`
  to a deterministic per-slot key
- Add orphan rollback after failed DB insert
- Add canonical-product lookup before creation
- Archive stale unlinked WOD Stripe products after audit

Safety rules I will follow
- I will not guess and bulk-remove products blindly.
- I will first identify the exact Stripe product IDs linked to the live WOD rows.
- I will archive only unlinked stale products.
- I will not break purchase history or replace the current valid products.

No database migration is required for the main fix unless we decide to add explicit audit metadata/logging.
