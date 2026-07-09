
## Answers to your questions first

- **Do we have failed-renewal messaging today?** Partially. The Stripe webhook already handles `invoice.payment_failed` and sends a plain "Payment Failed" email + dashboard notification. BUT: (1) it is hardcoded in the webhook, not a template in the admin Communications Center, so you can't edit it there; (2) the webhook itself is currently not being delivered by Stripe (established in previous turns), so in practice the message doesn't go out; (3) it fires only once — no distinction between 1st / 2nd / final attempt; (4) no cron fallback if the webhook misses.
- **How many times does Stripe retry?** Stripe's Smart Retries retry a failed subscription invoice up to **4 times over ~3 weeks** (configurable in Stripe → Billing → Subscriptions and emails → Retry rules). After the final failed attempt, the default action is to mark the subscription `unpaid` / `canceled`.
- **Can the user renew manually?** Yes — two ways already exist: **Manage Subscription** button in User Dashboard (opens Stripe Customer Portal → update card → Stripe re-attempts the open invoice), and the **/pricing → Subscribe** flow (starts a fresh subscription). Both work today. The expired-user experience on `/pricing` already shows the subscribe CTA.

## What this plan builds

### 1. New template in the admin Communications Center
Add 3 new rows to `automated_message_templates` so they appear in the admin panel and can be edited without code:

- `payment_failed_attempt` — 1st/interim failure, friendly reminder + "Update Payment Method" button
- `payment_failed_final` — after last Stripe retry, subscription about to be canceled
- (`renewal_thank_you`, `subscription_expired`, `cancellation` already exist and stay)

Content of `payment_failed_attempt` (the one you dictated), with emojis + icons:

> Subject: ⚠️ We couldn't renew your SmartyGym Premium
>
> Hello dear {{name}}, 👋
>
> Unfortunately we were unable to process the renewal of your Premium membership 💳❌.
>
> Don't worry — you can fix it in under a minute:
> 1. 💰 Make sure your card has funds or update it
> 2. 🔁 Click the button below to retry the payment manually
> 3. ✅ Your Premium access continues without interruption
>
> [Renew Manually →]  (links to Stripe Customer Portal via `customer-portal` function)
>
> Stripe will also automatically retry your card a few more times over the next days. If nothing works your subscription will pause, but you can reactivate anytime from /pricing.

### 2. Wire the templates into the webhook
Refactor `handleInvoicePaymentFailed` in `supabase/functions/stripe-webhook/index.ts` to:
- Read `invoice.attempt_count` from Stripe.
- If `attempt_count < invoice.next_payment_attempt != null` → send `payment_failed_attempt`.
- If `next_payment_attempt == null` (Stripe gave up) → send `payment_failed_final` and mark subscription `canceled`.
- Pull subject/body from `automated_message_templates` (not hardcoded), so edits in the admin panel actually take effect.
- Send both dashboard message + email through the same template row (parity with other lifecycle messages).
- Mark these templates as **mandatory** (bypass user opt-out), same as welcome/renewal.

### 3. Cron fallback (in case webhook is still missing)
New edge function `check-failed-renewals` (runs every 6h via pg_cron):
- Lists Stripe subscriptions in `past_due` / `unpaid` status.
- For each, checks the latest invoice's `attempt_count` and `next_payment_attempt`.
- Fires the same template if we don't already have a `notification_audit_log` entry for that invoice ID (idempotent via invoice id).
- Registers itself in `cron_job_metadata` so it appears in the admin cron dashboard.

### 4. Manual renewal UX for expired users
- `/pricing` already shows Subscribe for expired users — verify and leave.
- User Dashboard: when `status === 'past_due'` or `'unpaid'`, show a red banner "⚠️ Your last payment failed — [Update payment method] [Retry now]". Both buttons call the existing `customer-portal` function; updating the card in the portal triggers Stripe to auto-retry the open invoice.
- Add a "Renew Manually" deep link in the failure email → routes through `customer-portal` after login.

### 5. Admin panel synchronization
- Register the 2 new templates in the Communications Center → Automated Messages list (they surface automatically once the row exists with `is_active=true`).
- Add the new cron `check-failed-renewals` to `cron_job_metadata` so it shows under Admin → Cron Jobs with last-run + next-run.
- No changes to the Mass Announce / Templates / Test tabs (they read the same table).

### 6. Verification
- Run `tsgo` for typecheck.
- Trigger the new function once manually against `hfsc.nicosia@gmail.com` to confirm template render + dashboard row.
- Confirm the 2 templates show up and are editable in Communications Center.

## Files touched (technical)

- `supabase/migrations/<new>.sql` — insert 2 rows into `automated_message_templates`, insert 1 row into `cron_job_metadata`, schedule pg_cron job.
- `supabase/functions/stripe-webhook/index.ts` — rewrite `handleInvoicePaymentFailed` to load template + branch on `attempt_count`/`next_payment_attempt`.
- `supabase/functions/check-failed-renewals/index.ts` — new cron function (Stripe list + idempotent send).
- `supabase/functions/_shared/renderTemplate.ts` — small helper reused across lifecycle sends (if not already present).
- `src/pages/UserDashboard.tsx` (or existing subscription card component) — red past_due banner + Retry button.
- No changes to `/pricing`, `customer-portal`, `check-subscription`, or existing renewal templates.

## Out of scope
- Changing Stripe's retry schedule (that's in your Stripe dashboard, not in code).
- Fixing the missing webhook delivery itself — the cron fallback covers that gap, and the webhook fix (if any) is separate.
