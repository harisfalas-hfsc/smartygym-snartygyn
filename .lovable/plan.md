# Stripe Orphan Cleanup — Kinetic Cascade + Full Audit

## Summary

Three actions, all Stripe-only. Zero database, UI, or content changes.

## Part 1 — Archive the immediate orphan

Archive Stripe product **`prod_UOIMbl2vRFnTK8`** ("Kinetic Cascade").

- Confirmed: no row in `admin_workouts` references this product (the renamed `Kinetic Cascade Burn` is free and has `stripe_product_id = NULL`; today's WOD points to `prod_UOINFzqoCmbe3E`).
- Action: `stripe.products.update(prod_UOIMbl2vRFnTK8, { active: false })`. Archive (not delete) so historical invoices keep working. It will disappear from the active catalog.

## Part 2 — Full SmartyGym orphan audit

Run a one-time audit to catch any other dangling Stripe products from past WOD regenerations.

Steps:
1. List all active Stripe products with `metadata.project = "SMARTYGYM"`.
2. Fetch all `stripe_product_id` values from `admin_workouts`.
3. Diff: any active SMARTYGYM Stripe product NOT referenced in `admin_workouts` = orphan.
4. For each orphan:
   - Log id, name, created date, content_type metadata.
   - Archive it (`active: false`).
5. Skip and never touch:
   - The 6 subscription/corporate products and 3 standalone training programs and 10 micro-workouts listed in `src/config/pricing.ts` (`OUR_STRIPE_PRODUCT_IDS`) — these are permanent catalog items, not WOD-generated.

Report the full list of archived products back to you so you can spot-check.

## Part 3 — Verify WOD product naming

Confirm `prod_UOINFzqoCmbe3E` Stripe name = `Kinetic Cascade 0424EQ` (already confirmed via search — no rename needed). Just included as a final verification step in the report.

## Why the orphan exists

The WOD generator's idempotency logic creates a Stripe product when a WOD is generated. If a WOD is regenerated, replaced, or its DB row's `stripe_product_id` is overwritten, the previous Stripe product is left dangling unless explicitly archived. The pre-existing `archive-orphan-stripe-products` / cleanup logic apparently didn't catch this one (likely because the orphan was created in the same minute as the legitimate WOD, before the DB row settled). The audit in Part 2 will sweep it and any siblings.

## Files / Resources Touched

- **Stripe**: archive `prod_UOIMbl2vRFnTK8` + any orphans found in audit. No deletions.
- **Database**: read-only (used to build the orphan diff).
- **Code**: none. No edge function changes, no UI changes.

## Out of Scope

- No new recurring cleanup cron (can be added later if you want continuous protection — say the word).
- No changes to the WOD generator (already hardened in the previous fix).
- No changes to free workouts, premium workouts, or subscriptions.

## What You'll See After

- Stripe catalog will no longer show the duplicate "Kinetic Cascade" product.
- April 24 will show only the 2 legitimate WOD products (Kinetic Cascade 0424EQ + Velocity Core Cadence).
- A printed report of any other orphans archived.
