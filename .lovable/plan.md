## What actually happened with Manos Christofi

I pulled the truth directly from Stripe and from your database. The payment system worked correctly. Here is the timeline:

```text
Mar 5, 2026  Account created on SmartyGym
Mar 9, 2026  Started Gold subscription with 3-day free trial  (€0 invoice — PAID)
Apr 16, 2026 First real renewal charge                         (€9.99 — PAID)
May 16, 2026 Second renewal charge                             (€9.99 — PAID)
May 16, 2026 Subscription ENDED in Stripe (status = canceled)
May 20, 2026 Today
```

Stripe shows 3 invoices, all `paid`. The customer was charged every month he was supposed to be. **He has not been "missed" by the billing system.**

## Why he looks "Active" in your admin panel

The subscription is **canceled in Stripe** (`status: canceled`, period ended May 16) but in your database `user_subscriptions` still says:
- `status = active`
- `cancel_at_period_end = false`
- `current_period_end = May 16, 2026`
- `updated_at = April 20, 2026`  ← last time a Stripe webhook touched the row

So the `customer.subscription.deleted` webhook from Stripe did not update this user's row when the subscription canceled on May 16. The admin panel is just reading the stale DB row — that's why it shows him as "Gold, Paid, Paying".

## What the admin card labels really mean

- "Joined March 5" → profile `created_at`
- "First subscribed March 9" → subscription row `created_at` (trial start)
- "Current plan since April 16" → `current_period_start` (start of current billing cycle)
- "Last modified April 20" → `updated_at` (last webhook sync from Stripe)
- "Plan expires May 16" → `current_period_end` (correct — this is when the plan actually ended)
- "Purchases: 0" → correct. He has no individual standalone purchases. Subscriptions are stored separately from `user_purchases`, so subscribers always show 0 unless they also bought single workouts/programs.

## What I will do

### 1. Fix Manos's record now
Run `check-subscription` for his user_id to force a fresh pull from Stripe and update `user_subscriptions` to `status = canceled`, so the admin panel reflects reality immediately.

### 2. Find out why the cancellation webhook didn't sync
Check Stripe webhook logs and `stripe-webhook` function logs around May 16 for `customer.subscription.deleted` / `customer.subscription.updated` events on `sub_1T8yQgIxQYg9inGKcXc34Sa9`. Two likely causes:
- Webhook fired but errored.
- Webhook never reached us (endpoint misconfigured for that event type).

Fix whichever is found.

### 3. Add a daily drift-repair cron (safety net)
Add a `sync-stripe-subscription-status-daily` cron (e.g. 04:30 UTC) that walks every row in `user_subscriptions` whose `current_period_end < now()` and `status = 'active'`, re-checks each one against Stripe, and corrects `status` / `cancel_at_period_end` / `current_period_end`. This is the same defense-in-depth pattern you already use for `auto-finalize-draft-invoices` and `backfill-subscription-payment-methods` — it guarantees that even if a webhook is ever missed again, the admin panel will be correct within 24 hours.

### 4. Admin panel UX improvement (small)
In the user admin card, add a "Sync from Stripe" button that calls `check-subscription` for the selected user, so you can manually force a refresh on any user in one click. Also show "Subscription source: Stripe" and the real Stripe status next to the local status when they differ.

## Technical details

- Stripe customer: `cus_U7CTdKqa9gEq3U`
- Stripe subscription: `sub_1T8yQgIxQYg9inGKcXc34Sa9` — status **canceled**
- Stripe invoices (all `paid`): `in_1T8yQC` (trial €0), `in_1TBVm6` (€9.99), `in_1TMkXk` (€9.99)
- DB row id: `58a87adf-920e-437d-9a31-3c5c95fe1d48`
- The new cron will reuse the existing `check-subscription` edge function logic refactored into a service-role batch worker so it does not need a user JWT.

## What this does NOT change

- No price changes, no Stripe products touched.
- No customer is re-charged or refunded.
- The renewal-billing hardening you already have in place (4 layers: checkout default-PM, webhooks, 4h auto-finalize, weekly PM backfill) stays exactly as-is.
