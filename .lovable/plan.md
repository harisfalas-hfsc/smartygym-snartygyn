## Website Audit Report + Fix Plan
**Scope:** Backend / security / auth / Stripe / API. **Zero visual changes.** HFSC untouched.

---

## PART 1 — Technical Findings

| # | Severity | Area | Finding | File / Location |
|---|---|---|---|---|
| 1 | **High** | Stripe | `stripe-webhook` verifies signature ✅ but has **no idempotency** — a retried Stripe webhook could double-grant access / double-record purchases. | `supabase/functions/stripe-webhook/index.ts` |
| 2 | **High** | Auth/API | 2 admin-only edge functions are missing `has_role(uid,'admin')` checks: `trigger-full-audit`, `lookup-user-by-email`. Any signed-in user can call them. | those two `index.ts` |
| 3 | **High** | RLS | `social_media_analytics` INSERT policy is `WITH CHECK (true)` → anyone (incl. bots) can spam analytics. Needs basic guard. | linter WARN 1–2 |
| 4 | **Medium** | DB | `public.exec_sql(text)` is `SECURITY DEFINER` running arbitrary SQL. Currently EXECUTE is **not** granted to anon/authenticated (verified) — safe today, but one wrong GRANT = full DB takeover. Should be locked with explicit `REVOKE` + comment, or moved out of `public`. | DB |
| 5 | **Medium** | DB | 3 `SECURITY DEFINER` functions executable by anon (linter WARN 3–5): `get_public_testimonials`, `get_testimonial_rating_stats`, `get_visible_workout_metadata`. These are **intentionally** public-read; need to confirm + document. The rest (WARN 6–16) are signed-in-only functions that genuinely need DEFINER (e.g. `has_role`, `user_has_active_premium_access`) — acceptable, document in security-memory. | linter WARN 3–16 |
| 6 | **Medium** | API hygiene | 115 of 125 edge functions have no Zod / schema validation on request bodies. Public-facing ones (`send-contact-email`, AI endpoints, calorie counter, BMR, macro calc) are the priority. | `supabase/functions/*` |
| 7 | **Medium** | API hygiene | No `check_rate_limit()` calls anywhere in edge functions, despite the helper existing in DB. Contact form + AI endpoints are abusable. | DB function unused |
| 8 | **Medium** | Architecture | 18 edge functions call **other edge functions** over HTTP (violates project memory rule "Avoid calling Edge Functions from other Edge Functions"). Causes timeouts and cost. | listed in audit |
| 9 | **Low** | Auth | HIBP (leaked-password check) status unknown — to be confirmed and enabled if off. | auth config |
| 10 | **Low** | Code hygiene | ~30 one-shot `audit-*` / `fix-*` / `repair-*` / `backfill-*` edge functions still deployed. Bloat, not a vulnerability. | `supabase/functions/*` |
| 11 | **Low** | Logging | Several functions log full email / Stripe customer IDs at INFO. Reduce to last-4 or redact. | grep `console.log` |

### What is GOOD (no action needed)
- Core RBAC tables (`user_roles`, `user_subscriptions`, `user_purchases`, `profiles`, `corporate_*`) have correct RLS: users can't self-grant admin, can't self-insert subscriptions/purchases.
- Stripe SDK pinned to v18.5.0 across functions (per memory).
- Stripe webhook signature verification works.
- No `dangerouslySetInnerHTML` with unsanitized input found in workout/program rendering.
- All public tables have RLS enabled.
- npm dependency scan: 0 high/critical vulnerabilities.
- Auth flow uses correct `onAuthStateChange` pattern in 5 components.
- Server-side premium gating via `user_has_active_premium_access()` (SECURITY DEFINER, parameterized) is sound.

---

## PART 2 — UX Audit (gating correctness only, no visual edits)

| # | Severity | User type | Finding |
|---|---|---|---|
| U1 | **Medium** | Subscriber | Premium content gating is enforced by RLS on `user_subscriptions` reads — solid. But the `useAccessControl` context recomputes only on `onAuthStateChange`, so a subscription that just activated via Stripe doesn't unlock until next auth event or 60-sec poll. Need to invoke `check-subscription` on `/payment-success` mount. |
| U2 | **Low** | Visitor | Direct-URL access to premium detail pages returns the page shell + a server-blocked content fetch (correct), but no `noindex` meta is set on locked premium routes — SEO leak risk. |
| U3 | **Low** | Premium | Expired subscription "read-only retention" (per memory) is enforced in DB via `user_has_active_premium_access`. Verified — no leak. |
| U4 | — | All | Mobile / desktop layout, tap targets, copy: **reported separately on your request — not fixed** (per "no visual changes" constraint). |

---

## Fix Plan — Backend-Only, Phased

You approve once; I execute in order and stop after each phase for your sign-off if you want, or run all.

### Phase 1 — Critical / High (security)
1. **Stripe webhook idempotency** — create `stripe_webhook_events` table (event_id PK, processed_at). At top of webhook, `INSERT … ON CONFLICT DO NOTHING`; if conflict, return 200 immediately. No double-grants.
2. **Add admin gate** to `trigger-full-audit` and `lookup-user-by-email` (verify JWT → check `has_role(uid,'admin')` → 403 otherwise).
3. **Tighten `social_media_analytics` INSERT policy** — keep public insert but require `event_type IN (allowed_list)` and reject empty `session_id`.
4. **Lock `public.exec_sql`** — explicit `REVOKE EXECUTE FROM PUBLIC, anon, authenticated`; add COMMENT; keep service-role only.
5. **Confirm HIBP enabled** via `configure_auth` (no-op if already on).

### Phase 2 — Medium (hardening)
6. **Add Zod validation** to the 6 public/abusable functions: `send-contact-email`, calorie/BMR/macro/1RM calculator endpoints, any AI-gateway endpoint accepting free-text.
7. **Wire `check_rate_limit()`** into the same 6 functions (IP + endpoint, 30/hr default).
8. **Trigger `check-subscription` on `/payment-success` mount** so paid access unlocks instantly (no UI change — uses existing context).
9. **Add `noindex` to locked premium routes** when content is gated (server-driven; no visual change).
10. **Document the 13 accepted SECURITY DEFINER functions** in security-memory so future scans don't re-flag them.

### Phase 3 — Low / hygiene (optional, non-urgent)
11. Redact emails / Stripe IDs in logs.
12. Archive (don't delete — per memory) the ~30 one-shot `audit-*` / `fix-*` functions to a `_legacy/` folder marker for later cleanup. **HFSC excluded.**
13. Refactor the 18 functions that call other edge functions to use direct DB calls or shared `_shared/` modules — per existing project rule.

### Hard guarantees
- No `.tsx`, `index.css`, or `tailwind.config.ts` changes.
- No copy, image, color, spacing, or layout changes.
- Visitor / subscriber / premium see **exactly** the same UI before and after.
- HFSC code, data, tables, functions — **untouched**.
- Each phase = its own commit set; rollback per phase if needed.
- After each phase: re-run linter + security scan and report deltas.

### Deliverable
At the end: `/mnt/documents/audit-report.md` with the findings table above, what was fixed in which phase, and remaining accepted risks.

**Approve to execute Phases 1 + 2 (the ones that actually matter). Phase 3 only if you say so.**
