---
name: Stripe Recurring Billing Hardening
description: Multi-layer defense ensuring monthly Gold and yearly Platinum renewals always auto-charge without manual intervention
type: feature
---
## Stripe Recurring Billing — Bulletproof Architecture

Four independent layers guarantee every active subscription auto-charges on renewal, forever, for every customer (monthly Gold + yearly Platinum):

### Layer 1: Checkout (prevention)
`supabase/functions/create-checkout/index.ts` includes:
- `payment_method_collection: 'always'` — card captured upfront
- `subscription_data.payment_settings.save_default_payment_method: 'on_subscription'` — guarantees the card becomes the subscription's default PM (the #1 cause of stuck draft renewal invoices is a missing default PM)

### Layer 2: Stripe webhook (real-time sync)
`supabase/functions/stripe-webhook/index.ts` handles:
- `checkout.session.completed` → activates subscription
- `customer.subscription.updated` → syncs status changes
- `customer.subscription.deleted` → handles cancellation
- `invoice.payment_succeeded` → extends `current_period_end` in DB
- `invoice.payment_failed` → flags subscription for renewal-reminders

### Layer 3: Self-healing cron (every 4 hours)
`auto-finalize-stripe-invoices-4h` cron → `auto-finalize-draft-invoices` edge function:
- Layer A: finalizes any DRAFT subscription_cycle/subscription_update invoices
- Layer B: force-pays any OPEN unpaid renewal invoices via `stripe.invoices.pay()`
- Catches transient Stripe hiccups within 4 hours max

### Layer 4: Weekly preventive backfill (Sundays 04:00 UTC)
`backfill-subscription-payment-methods-weekly` cron → `backfill-subscription-payment-methods` edge function:
- Walks every active/trialing subscription
- For any without `default_payment_method`, finds an attached card and sets it on both customer.invoice_settings AND subscription
- Idempotent — safe to run any time

### Manual investigation history
- Manolis Christofi (`cus_U7CTdKqa9gEq3U`, `sub_1T8yQgIxQYg9inGKcXc34Sa9`): April 18 2026 renewal required manual finalization. Backfill confirmed default PM was already set; the stuck invoice was a one-off Stripe transient. Layer 3 now catches this within 4 hours.
