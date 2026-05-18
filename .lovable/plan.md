# Verify every published workout & training program has a live Stripe product

## What I already confirmed from the database

```text
admin_workouts (is_visible = true)
  Total visible.............. 483
  Visible & premium.......... 448
  Visible+premium+standalone. 448
  Missing stripe_product_id.. 0
  Missing stripe_price_id.... 0

admin_training_programs (is_visible = true)
  Total visible.............. 28
  Missing stripe_product_id.. 1   ← "Cardio Foundations" (id = C-1)

WODs (latest 12, includes today + tomorrow's 2 pre-built variants)
  All have stripe_product_id + stripe_price_id
```

On your example: "Apex Current Press UPP-E-I" in the DB points to `prod_UX5F680sKd4f1t`, which still exists in Stripe. The archived `prod_UXM4mpiGMzWZ4j` with the same name is a duplicate from an earlier regeneration that the DB no longer references, so it was correctly archived.

The only gap so far: **Cardio Foundations (C-1)** has no Stripe product.

## What I still need to verify

Every DB row points to *an* id, but I have not yet confirmed each of those 475 product ids is `active=true` in Stripe. If a cleanup ever wrongly archived a referenced product, the DB still holds the id and the check above wouldn't catch it.

## Plan

1. **Run a one-shot reverse audit** — script (no new cron, no UI) that:
   - Pulls every `stripe_product_id` / `stripe_price_id` from `admin_workouts` and `admin_training_programs` where `is_visible = true`.
   - Calls Stripe to confirm each product is `active` and each price is `active`, currency `eur`, amount matches the DB `price`.
   - Returns the list of any mismatches.

2. **Repair anything broken**:
   - For each visible workout whose linked product is archived/missing → create a new Stripe product + price with SMARTYGYM metadata and update the DB row.
   - Create the missing product + price for Cardio Foundations (C-1) and link it.

3. **Report back** with: total checked, count OK, list of repaired items (old id → new id).

No cron, no scheduler, no extra infrastructure. Just verify and fix.
