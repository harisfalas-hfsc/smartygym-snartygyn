# SmartyGym.com — Pre-Launch QA Audit Plan

## What you'll get

1. A **plain-English chat summary** with severity-ranked findings.
2. A **downloadable PDF report** at `/mnt/documents/smartygym_prelaunch_qa.pdf` with full detail per module, screenshots where relevant, and recommendations.
3. **Zero fixes applied.** Every issue gets logged with severity (Critical / High / Medium / Low / Polish) and a recommended action. You decide what to fix and when.

## How I'll test (3 layers)

### Layer 1 — Code audit (read-only)
For each module in your protocol, I read the actual files that implement it: routes, hooks, edge functions, RLS policies, DB triggers, validation schemas. I trace each user flow end-to-end in code. This catches:
- Missing access checks (premium content leaking to free users)
- Broken RLS policies (one user seeing another's data)
- Missing email triggers
- Logic conflicts between client and server
- Edge functions that reference deleted tables/functions
- Race conditions in subscription state

### Layer 2 — Live browser walkthrough
I open the preview at multiple viewport sizes (mobile 390×844, tablet 768×1024, desktop 1366×768) and click through real flows as different user types:
- **Anonymous visitor** — can I browse, are CTAs visible, is premium locked
- **Brand new signup** — register, confirm, first login, profile, password reset
- **Free user** — what's visible, what's gated, can I bypass via direct URL
- **Premium user** — full access, purchase button hidden (your business rule), management
- **Expired user** — locked out correctly

I capture screenshots of any visual breakage, broken layouts, console errors, or 404s.

### Layer 3 — Stripe test-mode payment flows
I drive checkout to Stripe and use test cards to simulate:
- Successful subscription (monthly + yearly)
- Successful one-off purchase (workout + program)
- Card declined (`4000 0000 0000 0002`)
- 3D Secure required (`4000 0025 0000 3155`)
- Insufficient funds, expired card, processing error
- User closes browser mid-checkout (orphan session cleanup — your idempotency rule)
- Subscription upgrade/downgrade
- Cancellation and end-of-period access removal
- Resubscription after cancel

I verify: webhook fired, DB updated, access granted, email sent, receipt accessible.

**Note:** I'll confirm Stripe is in test mode before doing this. If it's live, I'll stop and ask.

## Modules covered (your full protocol)

1. Visitor experience — homepage, navigation, public pages, mobile responsiveness
2. Registration & account creation — signup, validation, welcome email, password reset, data isolation
3. Subscription & payment flows — monthly, yearly, standalone, edge cases, receipts
4. Access levels & content gating — every tier, server-side enforcement, direct-URL bypass attempts
5. Membership management — view, upgrade, downgrade, cancel, resubscribe, payment method
6. Workout & training experience — WOD, periodization, library, programs, tools (1RM, Macro, BMR)
7. Logbook & tracking — complete, favorite, schedule, history, persistence, privacy
8. Notifications & emails — welcome, payment, renewal, cancellation, WOD, in-app, unsub/resub, no duplicates
9. Security & safety — direct URL access, session protection, exposed data, rate limiting, XSS, RLS
10. Mobile & PWA — install, offline, push notifications
11. SEO & launch readiness — meta tags, sitemap, robots, structured data, Lighthouse scores
12. Bonus: brand consistency check (color palette, theme toggle, copy tone per your brand memory)

## What the report looks like

Each finding follows this structure:

```
[CRITICAL] Premium content accessible via direct URL
Module: 4 — Access Control
Where: /workout/[id] route, IndividualWorkout.tsx
Test: Logged in as free user, navigated to /workout/premium-workout-id
Result: Workout content rendered fully, no gate triggered
Why it matters: Bypasses entire premium business model
Recommended fix: Add server-side check via canUserAccessContent() before rendering
Estimated effort: 30 min
```

Severity scale:
- **Critical** — blocks launch (payment broken, security hole, signup fails, data leak)
- **High** — degrades core experience but app still works
- **Medium** — noticeable issue, fix before launch ideally
- **Low** — minor polish
- **Recommendation** — works fine, but here's how it could be better

## What I will NOT do
- Fix anything (you said report only)
- Touch live Stripe in live mode
- Delete or modify any user data
- Sign up real users with real emails
- Make any database changes
- Make any code changes

## Estimated time
- Code audit: ~90 min
- Browser walkthrough: ~45 min
- Stripe test charges: ~30 min
- Report writing + PDF generation + visual QA: ~30 min
- **Total: ~3.5 hours of work**

## Before I start — one confirmation needed

**Is your Stripe account currently in test mode, or live mode?**

If live, I will only test up to the Stripe redirect (no real charges). If test mode is active, I'll do the full payment matrix with test cards.

Tell me: "test mode confirmed" or "skip real Stripe tests" and I'll begin Module 1 immediately.
