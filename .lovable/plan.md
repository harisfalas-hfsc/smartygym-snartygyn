
# SmartyGym Launch-Readiness Plan (revised)

## Reality lock-in

What you actually sell today:

- **One subscription/membership product:** Lifetime Premium (€89.99, one-time) — Stripe price `price_1ThP4MIxQYg9inGKAUQEJ0tD`.
- **Standalone purchases:** individual training programs and micro-workouts.
- **Corporate plans:** separate B2B flow.

What's in the code today that contradicts that:

- `src/config/pricing.ts` still lists `gold` (€9.99/mo) and `platinum` (€89.89/yr) as if they were offered.
- DB enum `plan_type` still has `gold` and `platinum` values (currently unused — 0 rows).
- `stripe-webhook` hardcodes `plan_type: 'platinum'` in one path.
- `has_premium_subscription()` and `user_has_active_premium_access()` accept `gold`/`platinum` as valid premium.
- ~94 source files reference gold/platinum (UI strings, badges, marketing copy, admin pages).
- Live Stripe products "Smarty Gym Gold Plan" and "Smarty Gym Platinum Plan" still exist — **left untouched in Stripe per your instruction.**

## Section 0 — Strip Gold/Platinum from the product (do this first)

Goal: code matches reality. Lifetime Premium is the only membership. Gold/Platinum cannot be purchased, displayed, recommended, or treated as premium anywhere.

**Stripe:** untouched. No product/price edits, no metadata changes. The old products keep existing in Stripe; the app simply stops linking to them.

**Frontend:**
- Remove every Gold/Platinum pricing card, upgrade CTA, comparison row, badge, marketing banner, and ad-template variant.
- Pricing surfaces show only: Lifetime Premium + standalone purchases + Corporate.
- Remove `gold`/`platinum` keys from `src/config/pricing.ts`. Keep `lifetime` and `corporate_*`.
- Sweep the ~94 files: delete dead branches, rename surviving "premium" copy to just "Premium", drop legacy `SUBSCRIPTION_PRICES.gold/platinum` reads.
- Lock screens / paywall CTAs say "Upgrade to Lifetime Premium" — one path only.

**Backend / edge functions:**
- `create-checkout` no longer accepts `gold`/`platinum` plan keys. If a legacy request comes in with one, reject with 410 Gone.
- `stripe-webhook`: remove the hardcoded `plan_type: 'platinum'`. For any incoming subscription event matching the legacy Gold/Platinum price IDs, store as `plan_type: 'legacy_premium'` so the 2 existing-but-no-longer-sold tiers don't crash the webhook if a chargeback or refund event arrives.
- `check-subscription`: same — map legacy price IDs to `legacy_premium`, do not advertise renewal.

**Database (migration):**
- Add `legacy_premium` to the `plan_type` enum (safety net for old Stripe events only).
- Update `has_premium_subscription()` and `user_has_active_premium_access()` to grant premium for `lifetime`, `legacy_premium`, and active corporate — and **not** for `gold`/`platinum` going forward (no rows exist anyway).
- Do **not** drop `gold`/`platinum` enum values yet. Enum removal needs a follow-up release once we've verified no historical row or RPC depends on them.

**Acceptance:**
- Searching the repo for `gold` / `platinum` returns only: (a) the DB enum, (b) the `legacy_premium` mapping comments, (c) third-party content (blog posts, etc., if any). No UI, no checkout, no marketing.
- Lifetime checkout still works end-to-end. Existing `lifetime` users (the 2 in the DB) keep access.
- A simulated webhook event on the old Gold price doesn't crash and doesn't grant active premium status.

## Section 1 — Environment & secrets

- Confirm `.env` is gitignored; refresh `.env.example` with placeholders only.
- Grep frontend for any secret-shaped strings (service role key, Stripe secret, webhook secret, Resend, VAPID private, Google client secret). Move anything found to Edge Function secrets.
- `console.log/warn/error` sweep: drop dev-only logs in `src/**`, keep production-safe error logs in edge functions, strip anything that prints emails, Stripe IDs, tokens, or user records.
- Output: `SECURITY_AUDIT.md`.

## Section 2 — Supabase RLS audit

- Run `supabase--linter` and per-table policy review across all ~80 tables.
- Classify each: **public / owner-only / admin-only / service-role-only**.
- Verify premium content read path matches `mem://architecture/entitled-content-read-path`: non-entitled users only see paywall-stripped rows via `get_visible_*_metadata`; entitled users read base tables under RLS that calls `user_has_active_premium_access()`.
- Tighten gaps via migration; never loosen existing policies.
- Output: `SUPABASE_RLS_REPORT.md` (per-table matrix).

## Section 3 — Premium access matrix

Validate every relevant user scenario against workout list/detail, program list/detail, WOD, dashboard, favorites, completed, logbook, admin pages, and paywall UI:

- Visitor (no account)
- Free registered user
- Lifetime Premium user
- **Legacy Gold/Platinum holder** (none today, but the webhook path must still behave correctly if a refund/chargeback fires)
- Standalone workout buyer
- Standalone program buyer
- Corporate admin / corporate member
- Admin role
- Cancelled / expired user (per `mem://business-rules/expired-subscription-access`)

Any leak gets a server-side fix (RLS or function check), not a UI patch.

## Section 4 — Stripe payment system

- Audit and exercise: Lifetime checkout, standalone workout, standalone program, corporate, customer portal, webhook, success/cancel pages, refund, failed payment.
- Centralize Stripe price IDs: `src/config/pricing.ts` for the client and a mirrored `supabase/functions/_shared/pricing.ts` for Deno. Kill scattered hardcoded `price_…` strings.
- Idempotency verified for both subscription-style events (legacy) and one-off paths (`stripe_webhook_events` table).
- Output: `PAYMENT_FLOW.md` (active products, price IDs, edge functions, webhook event matrix, success/cancel/failure flows).

## Section 5 — Edge function cleanup

- Enumerate every function in `supabase/functions/`, classify (production / admin / payment / notification / SEO / repair / unused).
- Archive only what's verifiably unused: not imported by client, not on cron, not called by another function, untouched > 90 days.
- **HFSC functions off-limits per memory — skipped entirely.**
- Confirm `verify_jwt` settings, admin checks, and that no public function returns service-role-protected data.
- Output: `BACKEND_FUNCTION_MAP.md` (function, purpose, caller, service-role y/n, risk level).

## Section 6 — Mobile/Capacitor readiness

- Audit Capacitor config + PWA manifest + safe-area handling on auth, workouts, programs, dashboard, timer, checkout, account deletion.
- Flag in-app Stripe-for-digital-goods policy risk on iOS/Android. Plan a Capacitor `Browser.open` external-checkout fallback for app builds. Web checkout unchanged.
- Output: `MOBILE_READINESS_REPORT.md`.

## Section 7 — SEO

- `seo--trigger_scan`, then fix titles, meta, canonical, sitemap, robots, JSON-LD per existing memories (`seo/search-and-ai-discovery-strategy`, `seo/blog-article-optimization`, `seo/library-and-media-optimization-standards`).
- No content rewrites.

## Section 8 — Performance

- Bundle analysis, lazy-load heavy admin routes, image-size audit, dedupe Supabase queries, kill obvious re-render hotspots.
- No architectural rewrites.

## Section 9 — Documentation

Rewrite `README.md` (stack, local dev, env vars, Cloud setup, Stripe setup, mobile setup, admin role, deployment, security notes, testing checklist) and create:

- `SECURITY_AUDIT.md`
- `SUPABASE_RLS_REPORT.md`
- `PAYMENT_FLOW.md`
- `BACKEND_FUNCTION_MAP.md`
- `MOBILE_READINESS_REPORT.md`
- `LAUNCH_CHECKLIST.md`

## Section 10 — Final launch checklist

Generated last, with tickboxes for: secrets, RLS, premium access (Lifetime only), Lifetime/standalone/corporate purchases, webhook events including legacy refund path, mobile login + checkout, push notifications, sitemap/robots/metadata, privacy/terms/account-deletion visibility.

## Execution order and safety gates

```text
0. Strip Gold/Platinum ──► 1. Secrets ──► 2. RLS ──► 3. Access matrix ──► 4. Stripe
                                                                            │
                          ┌────────────────────────────────────────────────┘
                          ▼
                       5. Edge fn cleanup ──► 6. Mobile ──► 7. SEO ──► 8. Perf
                                                                       │
                                                                       ▼
                                                              9. Docs ──► 10. Checklist
```

Between sections: run tests, `supabase--linter`, and verify the build before moving on. Enum cleanup of `gold`/`platinum` is deferred to a follow-up release after one clean cycle.

## What I will NOT touch

- HFSC (off-limits per memory).
- The "100% Human, 0% AI" brand language.
- Any visual/structural redesign.
- Stripe products themselves (Gold/Platinum products stay in your Stripe account untouched).
- Paid content (archival only per `system/non-destructive-content-management-policy`).
- Auto-generated files (`supabase/config.toml` project block, `client.ts`, `types.ts`, `.env` keys).
