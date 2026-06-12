
# Switch to a Single Lifetime Membership

Goal: retire recurring Gold (monthly) and Platinum (yearly) plans and introduce **one** lifetime membership — **€89.99 one-time, unlocks everything forever**.

---

## 1. Stripe: new Lifetime product

Create one new Stripe product in live + test:

- Name: **SmartyGym Lifetime Membership**
- Type: **one-time** (no recurring interval) — €89.99 EUR
- Image: reuse the Gold plan visual (gold crown/banner image already used on the page)
- Metadata: `project: "SMARTYGYM"`, `content_type: "Lifetime Membership"`

Add the resulting `prod_…` and `price_…` to `src/config/pricing.ts` as `STRIPE_PRICE_IDS.lifetime` and `OUR_STRIPE_PRODUCT_IDS`. Existing Gold/Platinum price IDs stay in the file (so historical subscribers keep working) but are no longer surfaced in the UI.

## 2. Database

New migration:

- Extend `plan_type` enum with `'lifetime'`.
- Update `has_premium_subscription` and `user_has_active_premium_access` to also treat any row in `user_subscriptions` with `plan_type = 'lifetime'` (status `active`, no expiry) as premium.
- Existing Gold/Platinum subscribers are **grandfathered**: their rows are untouched and they remain premium until their natural end (per non-destructive policy).

## 3. Checkout flow

- New edge function `create-lifetime-checkout` based on `create-checkout`, but `mode: "payment"` (one-off), success → `/payment-success`, cancel → original page.
- On `checkout.session.completed` for the lifetime price in `stripe-webhook`: insert/update `user_subscriptions` with `plan_type = 'lifetime'`, `status = 'active'`, `current_period_end = null` (or far-future). No renewal logic needed.
- Block re-purchase if the user already has lifetime or any active premium plan (return friendly "Already premium" toast, same pattern as today).

## 4. SmartyPlans page (`src/pages/SmartyPlans.tsx`)

Replace the dual-card carousel and yearly comparison with a **single Lifetime card** (centered, max ~480px on desktop, full-width on mobile — no swipe carousel needed).

Card content:
- Title: **Lifetime Membership**
- Price: **€89.99 · one-time**
- Tagline: "Pay once. Train for life."
- Bullets: Full access to all Workouts · Training Programs · Smarty Ritual · Smarty Tools · Check-ins · Dashboard & LogBook · Coach support · All future updates included
- CTA: "Get Lifetime Access" → `create-lifetime-checkout`
- Footnote: "One-time payment. No subscription. Yours forever."

Other sections on the page:
- **Header banner**: remove "Cancel anytime. Auto-renews until cancelled." Replace with "One payment. Lifetime access. Forever yours."
- **"What You Get with Premium"**: keep grid; rename to **"What's Included for Life"**; refresh copy to lifetime tone ("All yours, forever").
- **"Compare Access Levels"**: keep (Visitor / Subscriber / Premium); change Premium sub-label from "Gold / Platinum" to "Lifetime".
- **"Why Choose Yearly" card**: delete entirely.
- **The 3 instances of `PricingPlansBlock`**: collapse to a single `LifetimeCard` rendered once (top) and once (bottom, after the comparison table). Remove the helper `PricingPlansBlock` component and the `PlanTier` type.
- **"Looking for Corporate Plans?" card**: remove (hide).
- **FAQ teaser card**: keep.
- SEO/Helmet/JSON-LD: replace the two Product schemas with one Product schema for the Lifetime Membership (€89.99 one-time). Update title, description, OG, Twitter, AI-pricing meta tags, `SEOEnhancer` props, and the `aiSummary` to reflect a single lifetime plan.

## 5. FAQ (`src/pages/FAQ.tsx`)

Rewrite the "Is there a free trial?" entry (and any other mention of Gold/Platinum, monthly/yearly, "cancel anytime") to describe the single Lifetime Membership — both the visible accordion text **and** the FAQPage JSON-LD `mainEntity`.

Search-replace any other "Gold" / "Platinum" / "monthly" / "yearly" / "auto-renew" / "cancel anytime" copy that still references the two-plan model on this page.

## 6. Hide Corporate

- Remove the `<Route path="/corporate" …>` from `src/App.tsx` (also `/corporate-wellness` if the user wants the public corporate surface fully hidden — confirmed by their wording: hide the entire corporate page). Keep the file `SmartyCorporate.tsx` and the admin `corporate-admin` route untouched.
- Remove every navigation link pointing to `/corporate` (footer, nav, About page, the SmartyPlans corporate CTA card).
- Add a fallback: `/corporate` → redirect to `/smarty-plans` so old links don't 404.

## 7. Homepage CTA

`src/pages/Index.tsx` "Join Premium" button keeps its current destination (`/smarty-plans`) — no change beyond the page itself now showing the single lifetime plan.

## 8. Out of scope (intentional)

- No migration of existing Gold/Platinum subscribers — they keep their current subscription per the non-destructive policy. Stripe webhooks, renewal reminders, and the 4-hour auto-finalize cron continue to serve them until natural end.
- No price changes for already-bought standalone workouts/programs/micro-workouts.
- The two existing Stripe subscription products are **not deleted** in Stripe (keeps historical reporting intact); they are simply no longer linked from the UI.

---

## Files touched

- `src/config/pricing.ts` — add lifetime IDs
- `src/pages/SmartyPlans.tsx` — single-card rewrite + section cleanup
- `src/pages/FAQ.tsx` — copy + JSON-LD
- `src/App.tsx` — remove `/corporate` route, add redirect
- `src/components/Navigation.tsx` + footer + `src/pages/About.tsx` — drop corporate links
- New `supabase/functions/create-lifetime-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts` — handle one-time lifetime purchase
- New migration: extend `plan_type` enum, update access helpers

## Open question

After approval I'll need the actual Stripe Lifetime **product ID** and **price ID** once I create the product (I'll create it via the `stripe--create_stripe_product_and_price` tool with `project: SMARTYGYM` metadata, then paste the IDs into `pricing.ts`).
