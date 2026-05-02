# Next Batch: Quick Wins + 1 Critical Security Fix

## Goal
Fix 5 issues. All low-risk except #1 which is a real security leak. No design changes, no removed features.

---

## What I Verified Just Now

| Audit claim | Reality |
|---|---|
| "useAccessControl falls back to subscriber on error" | ✅ TRUE — line 225 catch block sets `userTier: "subscriber"`. Real security leak. |
| "5s timeout falls back to guest" | ✅ TRUE but **already correct** (guest is the safe default). No fix needed — the audit was wrong to flag it. |
| "Hardcoded Stripe price IDs in 6+ files" | ✅ TRUE — found in 9 files. Config file `src/config/pricing.ts` exists but only holds prices/product IDs, not price IDs. |
| "Free trial hardcoded to gold" | ⚠️ PARTIAL — backend accepts any `priceId`. Need to check frontend sends the right one. |
| "Unknown message type warning" | ❓ Not found in codebase right now. Will skip unless reproduced. |

---

## The 5 Fixes

| # | Fix | Risk | What Changes |
|---|-----|------|--------------|
| 1 | **Change error fallback from "subscriber" → "guest"** in `AccessControlContext.tsx` line 225 | 🟡 Low | If subscription check crashes, users see locked content (correct behavior) instead of getting free premium access. |
| 2 | **Centralize Stripe price IDs** into `src/config/pricing.ts` | 🟢 Zero | Add `STRIPE_PRICE_IDS` constant. Update 9 files to import from it. No behavior change. Easy to update prices later. |
| 3 | **Verify free-trial sends correct price ID** for the user's chosen plan | 🟢 Zero | Audit `Auth.tsx` / trial signup flow. If it always sends gold, fix to pass selected plan. |
| 4 | **Set up custom branded auth emails** (signup, password reset, magic link) | 🟢 Zero | Replace generic Supabase emails with branded SmartyGym templates. Requires verified email domain. |
| 5 | **Lock down 4 unused public storage bucket policies** (review `blog-images`, `ritual-images`, `promotional-videos`, `app-store-assets` listing) | 🟢 Zero | Read access stays public (needed for site). Just remove the ability for outsiders to *list* every filename. |

---

## What I Will NOT Touch
- Any UI/design
- Any feature, page, or button
- Subscription logic beyond the one-line fallback fix
- Any working trigger, cron, or function

---

## Order of Operations

1. **Fix #1** (1-line change in AccessControlContext.tsx)
2. **Fix #2** (add price IDs to pricing.ts, update 9 file imports — pure refactor, zero behavior change)
3. **Fix #3** (read trial flow code, fix only if broken — report findings either way)
4. **Fix #5** (one DB migration tightening bucket policies)
5. **Fix #4** (auth email setup — needs your email domain verified; I'll check status first)

---

## Deliverable
- 1 small frontend code change (#1)
- 1 refactor (#2)
- Possibly 1 small frontend fix (#3)
- 1 DB migration (#5)
- Email templates scaffolded (#4)

After all 5: a short confirmation report telling you exactly what changed and what to test.

**Approve to execute.**