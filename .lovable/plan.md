## Why everything is broken right now

There are **two independent bugs**, both introduced by recent edge-function changes. Each one breaks one purchase path. Together they break every paid flow on the site.

### Bug 1 — Individual purchases (any workout, WOD, training program)
**Function:** `supabase/functions/create-individual-purchase-checkout/index.ts`

Verified from edge-function HTTP logs: every `POST` is returning **HTTP 404 "Content not found"**, which the UI surfaces as *"Failed to initiate purchase. Please try again."*

Root cause: the function builds its Supabase client with the **anon key** and never attaches the caller's JWT. It then reads `admin_workouts` / `admin_training_programs` to validate the item. RLS on those tables only lets the anon role see **free** rows:

```
Public can view visible free workouts: is_visible=true AND is_premium=false
```

Every paid/standalone row is `is_premium = true`, so the lookup returns `null`, the function returns 404, and the toast fires. This affects 100% of free users buying any premium content (WOD, premium workout, premium program).

### Bug 2 — Subscription plans (Gold / Platinum)
**Function:** `supabase/functions/create-checkout/index.ts`

Verified from edge-function logs (16:12:21 UTC today):
```
StripeInvalidRequestError: Received unknown parameter:
  subscription_data[payment_settings]
```

Root cause: the checkout session is sending `subscription_data.payment_settings.save_default_payment_method = 'on_subscription'`. That field is **not valid on Checkout Session** (it belongs on the Subscription object). Stripe rejects the whole request with a 400, the function returns 500, and the UI shows *"Failed to initiate purchase"*. This blocks 100% of new Gold and Platinum signups.

The session already sets `payment_method_collection: 'always'`, which is the supported way to force payment-method collection at checkout, so the broken block can simply be removed.

## Why it "used to work"

Both regressions are recent edge-function edits:
- `create-individual-purchase-checkout` was changed to do server-side content validation but the client was downgraded from service-role to anon, so RLS now hides the very rows it needs to read.
- `create-checkout` had the `subscription_data.payment_settings` block added as part of the "auto-finalize renewal" hardening — that field name was wrong and Stripe started rejecting it.

Neither bug is a Stripe-account or app-store issue. They are pure code regressions inside two edge functions.

## Fix

### File 1 — `supabase/functions/create-individual-purchase-checkout/index.ts`
- Build the Supabase client with `SUPABASE_SERVICE_ROLE_KEY` (same pattern already used by `verify-purchase`, `check-subscription`, etc.). The function already enforces every business rule server-side (`is_visible`, `is_standalone_purchase`, `price > 0`, premium-block, duplicate-purchase, Stripe-link integrity), so service-role read access on those two admin tables is safe.
- Keep authenticating the caller via `auth.getUser(token)` so we still know which user is purchasing.
- Add `console.log` lines for `contentType`, `contentId`, lookup result, and any early return reason so future regressions show up in logs immediately.

### File 2 — `supabase/functions/create-checkout/index.ts`
- Remove the entire invalid block:
  ```
  subscription_data: {
    metadata: {...},
    payment_settings: { save_default_payment_method: 'on_subscription' }
  }
  ```
  Keep only the `subscription_data.metadata` portion (move metadata back as a plain `subscription_data: { metadata: {...} }`). `payment_method_collection: 'always'` is already set at the top level and is the correct mechanism.
- Add a short comment explaining why `payment_settings` is not allowed on Checkout Session so the hardening intent isn't lost.

No frontend changes. No database/RLS changes. No Stripe products, prices, or webhooks touched.

## How we make sure it stays stable (pre-app-store)

1. Deploy the two edge-function fixes.
2. Verify as the same free account `hfsc.nicosia@gmail.com`:
   - Click Purchase on today's WOD (`WOD-REC-V-1779261604369`) → must receive a Stripe Checkout URL (200), not a 404.
   - Click Purchase on a premium training program → same result.
   - Click subscribe to Gold → must receive a Stripe Checkout URL (200), not the `payment_settings` error.
3. Re-check edge-function logs after each attempt to confirm a 200 response and no exceptions.
4. Add the new diagnostic logs so any future regression in either function surfaces in the first failed call instead of presenting as a generic toast.

That is the complete fix — two small, surgical edge-function edits, no risk to anything outside the checkout paths.
