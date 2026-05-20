## Goal
Eliminate the 3-day free trial across the app, copy, and Stripe so Gold (monthly) and Platinum (yearly) become plain auto-renewing subscriptions that start the day the user pays.

## 1. Checkout — stop sending trial to Stripe
**`supabase/functions/create-checkout/index.ts`**
- Remove the `trial` parameter from the request body destructure.
- Remove `...(trial ? { trial_period_days: 3 } : {})` from `subscription_data`.
- Update `logStep` to drop the trial field.

Result: every new Gold/Platinum checkout starts billing immediately on day 1, auto-renews monthly (Gold) or yearly (Platinum) using the saved default payment method (Layer 1 hardening stays intact).

## 2. Auth flow — drop ?trial=true redirect
**`src/pages/Auth.tsx`** (lines ~77–94)
- Delete the entire `if (params.get("trial") === "true") { ... }` block that auto-invokes create-checkout with `trial: true` after signup.
- After signup the user simply lands on `/` (or `/smarty-plans` if `?plan=…` is present — optional, but current behavior already goes to `/`, so leave as `/`).

## 3. SmartyPlans page — remove all trial copy & CTAs
**`src/pages/SmartyPlans.tsx`**
- Line 310: remove the “🎉 Try free for 3 days. Cancel anytime.” paragraph (keep the surrounding box with the "Join thousands…" line, or remove the inner `<p>` only).
- Line 492 + 537: delete the `🎉 3 days free trial included` lines under both Gold and Platinum cards.
- Line 515 + 560: change button label from `Start 3-Day Free Trial` → `Start Your Plan` (loading text stays `Processing...`).
- Ensure the checkout invoke call does NOT pass `trial: true` (verify and strip if present).

## 4. About SmartyGym page — remove trial copy & link
**`src/pages/AboutSmartyGym.tsx`**
- Line 739: remove “🎉 Try free for 3 days — cancel anytime. No commitment.”
- Lines 833–835: change `<Link to="/auth?mode=signup&trial=true">` button text `Start 3-Day Free Trial` → `Start Your Plan`, and change link target to `/smarty-plans` (so visitors reach the plans page) — or to `/auth?mode=signup` if a signup-first flow is preferred. Default: `/smarty-plans`.

## 5. ArticleDetail page
**`src/pages/ArticleDetail.tsx`** line 266: button label `Start Your Free Trial` → `Start Your Plan`. Keep the `/join-premium` route.

## 6. FAQ page
**`src/pages/FAQ.tsx`**
- Remove the entire "Is there a free trial?" Q&A from both the JSON-LD FAQ schema (lines 80–84) and the visible AccordionItem (lines 337–340) — or replace the answer with: "No free trial. Gold (€9.99/month) and Platinum (€89.89/year) start the day you subscribe and auto-renew. Cancel anytime from your dashboard." Default: replace, so the FAQ still answers the natural search question.

## 7. Free trial popup component
**`src/components/growth/FreeTrialPopup.tsx`** — already commented out from `src/App.tsx`. Leave the file on disk (user said "keep in background"), no further changes needed.

## 8. Stripe — cancel any trialing subscriptions
- Verified via `stripe.subscriptions.list({ status: 'trialing' })`: **0 active trialing subscriptions** at this moment. Nothing to clean up.
- Stripe Prices for Gold (`price_1SJ9q1…`) and Platinum (`price_1SJ9qG…`) have no `trial_period_days` set on the price itself — the 3-day trial was only ever attached at checkout-session creation. Once step 1 ships, no new subscription will ever receive a trial.
- No webhook, product, or price changes needed in the Stripe dashboard.

## 9. Renewal-reminders edge function — no change
`supabase/functions/send-renewal-reminders/index.ts` references "3 days" only as the lead time for **renewal** reminders (3 days before `current_period_end`), unrelated to the free trial. Leave as-is.

## 10. Memory cleanup
- Delete `mem://business-rules/3-day-free-trial-system`.
- Remove the "[3-Day Free Trial]" line from `mem://index.md` and update `[Free Trial Popup]` / `[Renewal Reminders]` notes that mention the trial.

## 11. Verification (after implementation)
- `rg -i "3.day free trial|free for 3 days|trial=true|trial_period_days|Start.*Free Trial"` on `src/` and `supabase/functions/` → expect only `FreeTrialPopup.tsx` (kept intentionally).
- Confirm `create-checkout` no longer reads `trial` and Stripe call no longer includes `subscription_data.trial_period_days`.
- Re-run `stripe--list_subscriptions status=trialing` → expect `[]`.
- Manual smoke test of one checkout (Gold) in the preview to confirm Stripe Checkout shows "Pay now" instead of "Start trial".

## Technical notes
- All copy changes are surface-level Tailwind/JSX; no design tokens or component variants change.
- `STRIPE_PRICE_IDS` import in `Auth.tsx` becomes unused after step 2 — remove the import if it's only used there.
- The `popup-free-trial-bright.jpg` asset stays untouched (used by the kept-but-disabled `FreeTrialPopup`).
