# Subscription & Payment System Audit

I traced every paid scenario end-to-end (Gold, Platinum, standalone workout, standalone program), checked Stripe live config, the 6 cron jobs that protect billing, the webhook, and the DB state. Below is what's actually happening, then a prioritized fix list.

---

## 1. What is CORRECT (no action needed)

**Stripe products & prices — verified live in Stripe**
- Gold = `price_1SJ9q1IxQYg9inGKZzxxqPbD` → €9.99 EUR, **recurring monthly**, active.
- Platinum = `price_1SJ9qGIxQYg9inGKFbgqVRjj` → €89.99 EUR, **recurring yearly**, active.
- Both are `type: recurring` → Stripe itself drives auto-renewal. No code path can stop renewals; only the customer canceling can.

**Checkout flow (`create-checkout`)**
- Forces `payment_method_collection: 'always'` → card captured upfront, attached to customer. This is the foundation that lets Stripe auto-bill on renewal.
- Blocks double-subscriptions if user already has an active SmartyGym sub.
- Writes `user_id` into both session and subscription metadata (so the webhook can find the user).

**Standalone purchase flow (`create-individual-purchase-checkout`)**
- **Blocks Gold/Platinum users from buying standalone** (`status: 'active' AND plan_type IN gold/platinum` → 403). Premium users cannot accidentally double-pay.
- Validates content from DB (not from client), enforces visibility + standalone flag + price + stripe link integrity.
- Creates Stripe product/price with idempotency keys (no duplicates on retries).
- Recorded in `user_purchases` with `purchased_at` and no expiry column → **standalone purchases are kept forever** unless `content_deleted=true`.

**Webhook (`stripe-webhook`)**
- Signed via `STRIPE_WEBHOOK_SECRET`, idempotency table `stripe_webhook_events` prevents double-processing.
- Handles: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded` (renewal), `invoice.payment_failed` (dunning).
- On renewal → sends "thank you" email + dashboard message.
- On payment failure → sets `status = 'past_due'` + sends "update payment method" email.

**Access control layers**
- DB function `user_has_active_premium_access` (admin OR active gold/platinum OR corporate) — used by RLS.
- Frontend `src/lib/access-control.ts` — premium see everything, free see free + their purchases, guests see public only.
- Both layers consistent.

**The Manos Christofi class of bugs is now defended by 3 safety nets running on cron:**
1. `backfill-subscription-payment-methods` (weekly Sun 04:00 UTC) — for every active sub, ensures customer AND subscription have a `default_payment_method`. This is the root cause of Manos: Stripe couldn't auto-charge because the subscription had no default PM, so it created a DRAFT instead.
2. `auto-finalize-draft-invoices` (hourly + every 4h) — finalizes any stuck DRAFT renewal invoices, then force-pays any OPEN unpaid renewal invoices via `stripe.invoices.pay()`.
3. `send-renewal-reminders` (daily 09:00 UTC).

Status of these jobs in `cron_job_metadata`: all `is_active=true`, `is_critical=true`, last runs `scheduler-succeeded`. **Manos's specific failure mode cannot reoccur silently** — even if Stripe drops to DRAFT, the hourly job will finalize and charge within 1 hour.

---

## 2. CONFIRMED BUGS (need fixing)

### Bug A — Stripe API field shift in webhook (HIGH severity, could silently corrupt renewal dates)

The webhook reads `subscription.current_period_start` and `subscription.current_period_end` at the root of the Subscription object. In Stripe API version **`2025-08-27.basil`** (which we use), these root-level fields were removed; the values now live at `subscription.items.data[0].current_period_start` / `current_period_end`.

Locations (`supabase/functions/stripe-webhook/index.ts`):
- L290, L301–302 (corporate handler)
- L399 + L446–447, L466–467, L487–488 (subscription checkout handler)
- L807–808, L826–827 (subscription update handler)
- L928, L1032 (cancel + invoice handlers)

Effect: `new Date(undefined * 1000)` → `Invalid Date` → upsert writes NULL into `current_period_start/end`, or, depending on Stripe SDK version, writes the wrong values. Renewal date display, "next billing date" emails, and `expire-subscriptions` logic for the rare admin-grant edge all rely on this.

Fix: read the period from `subscription.items.data[0].current_period_start/end`. Same change in `create-checkout` is not needed because it doesn't touch those fields.

### Bug B — Plan upgrade/downgrade does not update `plan_type` (MEDIUM)

`handleSubscriptionUpdate` (L819+) updates Stripe fields but **never recomputes `plan_type`** for non-corporate users. If a customer upgrades Gold → Platinum through the Customer Portal, their `plan_type` stays `gold` in our DB until the next `check-subscription` call. Access still works (both are premium), but plan name in UI/emails is wrong, and downgrades break analytics.

Fix: in `handleSubscriptionUpdate`, look up the new price ID and recompute plan_type (same Gold/Platinum mapping as `check-subscription`), then include `plan_type` in the update.

### Bug C — Stale admin-granted subscription not expired

User `a519324c-…` (Applab Projects, gold, admin-granted) has `current_period_end = 2026-05-06`, status still `active`, today is 2026-05-31. `expire-subscriptions` runs daily 01:00 UTC and matches the WHERE clause exactly. Last run succeeded 2026-05-29 yet the row is still `active`.

Likely cause: the `granted_by` admin extended/renewed it manually after the cron ran, or there's a race on `subscription_source='admin_grant'`. Worth re-running `expire-subscriptions` once manually and logging which rows it touched. Not a code bug per se but operational data drift.

### Bug D — `check-subscription` plan detection is hardcoded by price ID (LOW–MEDIUM)

Lines 155–165 of `check-subscription/index.ts` map plan_type purely by literal price IDs. If you ever launch a regional promo price, a black-Friday coupon-priced variant, or rotate prices in Stripe, the code silently falls back to `'free'` for paying customers → they lose access.

Fix: read `plan_type` from the Stripe product's `metadata.plan_type` (already done by `handleSubscriptionCheckout` in the webhook — make `check-subscription` symmetric).

### Bug E — Email-only customer lookup

`check-subscription` and `customer-portal` find the Stripe customer by `email` only. If a user changes their account email, their existing Stripe customer becomes orphaned.

Fix: prefer `stripe_customer_id` from `user_subscriptions` when present; fall back to email lookup only when the row has no customer ID.

---

## 3. OPERATIONAL CHECKS YOU SHOULD DO ONCE IN STRIPE DASHBOARD

These are not code-fixable — they live in your Stripe account settings.

1. **Dashboard → Settings → Billing → Subscriptions and emails → Smart Retries**: must be ON (3–4 retries over ~3 weeks). Without this, a single declined card kills the renewal.
2. **Dashboard → Settings → Billing → Customer Portal**: must be activated (otherwise the "Manage subscription" button errors). Code already detects this and returns `portalNotConfigured: true`.
3. **Dashboard → Developers → Webhooks**: confirm the endpoint pointing at `…/functions/v1/stripe-webhook` is subscribed to at minimum: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. If any are missing, renewals will silently desync.

---

## 4. Scenario-by-scenario verdict

| Scenario | Verdict |
|---|---|
| Buy Gold (€9.99/mo) | ✅ Card captured, Stripe auto-renews monthly, webhook upserts plan_type=gold (modulo Bug A on dates) |
| Buy Platinum (€89.99/yr) | ✅ Same flow, yearly recurring confirmed in Stripe |
| Premium unlocks logbook / all content | ✅ `user_has_active_premium_access` returns true → RLS + frontend gate both honor it |
| Buy standalone workout / program | ✅ Recorded in `user_purchases`, never expires, premium block prevents double-pay |
| Standalone "kept forever" | ✅ No TTL column, `user_has_purchased_content` only filters `content_deleted=false` |
| Auto-renewal at month/year end | ✅ Driven by Stripe + protected by 3 cron safety nets; Manos's failure mode is closed |
| Plan upgrade via Customer Portal | ⚠️ Works for access, but plan_type in DB stale until next `check-subscription` (Bug B) |
| Failed payment / past_due | ✅ Webhook sets status=past_due + emails customer |
| Cancellation | ✅ User keeps access until period end, then `customer.subscription.deleted` fires |

---

## 5. Proposed fix order if you approve

1. **Bug A** (webhook period fields) — surgical 6-spot edit, no behavior change beyond correctness.
2. **Bug B** (plan_type on update) — small addition in `handleSubscriptionUpdate`.
3. **Bug D** (price-ID hardcoding) — switch `check-subscription` to read `product.metadata.plan_type`, same as webhook.
4. **Bug E** (customer lookup) — prefer stored `stripe_customer_id`.
5. **Bug C** (one stale row) — operational, I'd just run `expire-subscriptions` manually once to clean it.
6. Operational checks (#3 above) — you do them in Stripe Dashboard.

If you approve, I'll apply 1–4 as one focused build pass (no UI changes, only the four edge functions).
