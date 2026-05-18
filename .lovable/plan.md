# Plan: Fix missing Stripe product images

## What I confirmed
All 5 workouts you named (Metabolic Ignite, Stability Core, The Grinder, Calorie Torch, Cardio Power) **do have valid `image_url` values in our database** and on their published pages. They were created on the platform on May 17 and have Stripe product IDs linked. The missing piece is only on Stripe's side: when those products were created, the image upload step to Stripe didn't complete (likely a one-off failure during the original sync, common cause = the image URL wasn't reachable by Stripe at that moment, or the sync function timed out).

So this is a Stripe-side gap only — nothing is broken on your site.

## What I will do (background only, no UI changes)

1. **Run `audit-stripe-images` edge function** (already exists). It scans every paid workout + every paid program that has a `stripe_product_id`, fetches the product from Stripe, and flags any whose `images[]` array is empty or stale vs the DB `image_url`. Output: a full list of mismatches.

2. **Confirm the 5 named workouts appear in the missing list** and capture the full list of any other workouts/programs in the same state.

3. **Repair** using the existing `sync-stripe-images` / `update-stripe-product-image` functions in batches. For each mismatched item:
   - Push the current `image_url` to the Stripe product's `images[]`
   - Verify Stripe now returns the image
   - Log success/failure per item

4. **Report back** with a per-item table: name · Stripe product ID · before (no image / wrong image) · after (✅ image attached). Only confirm "done" after re-fetching each from Stripe and verifying.

## Risk / impact
- Zero changes to the website, UI, schemas, or any workout content
- Zero changes to prices, products, or Stripe metadata other than the `images` field
- Purely a background catch-up on image attachments
- Safe to run repeatedly (idempotent — skips items that already match)

Approve and I'll run the audit + repair and come back with the verified list.