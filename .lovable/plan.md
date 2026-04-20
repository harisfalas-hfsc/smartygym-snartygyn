

# Fix Everything — Full Remediation

Execute all batches from the audit in priority order. One approval, then I work through them sequentially and report back after each batch.

## Batch A — Critical Safety (first)

**A1. Fix `delete-user-account` brace mismatch**
- Repair the syntax bug so GDPR deletion works.
- Redeploy function.
- Test with a dummy call (dry-run path) to confirm it boots.

**A2. Resolve the 737 broken exercise links**
- Run `batch-relink-exercises` across all workouts + programs in dryRun=false mode, batched (5 at a time) to stay under Edge limits.
- For each entry in `mismatched_exercises`: re-run AI matching → if confidence ≥ 0.75 replace with `{{exercise:ID:Name}}`, else mark `needs_manual_review = true`.
- Report final numbers: auto-fixed vs needs-manual.

## Batch B — Revenue & Renewal Integrity

**B1. Backfill NULL `current_period_end` from Stripe**
- For every active subscription with `stripe_subscription_id` and NULL renewal date, fetch live data from Stripe and write the real `current_period_end` + `current_period_start`.
- Specifically heals Manos Christofi and any other affected paid users.

**B2. Renewal reminders verification**
- Re-run `send-renewal-reminders` after backfill so the cron sees real dates.
- Confirm 3-day and 1-day reminders queue correctly.

## Batch C — SEO Coverage for Blog

**C1. Generate SEO metadata for all 30 published articles**
- Call the existing blog SEO generator for each article missing a `seo_metadata` row.
- Populate: meta_title, meta_description (≤160 chars), keywords, og_image, JSON-LD Article schema, image alt text.
- Verify sitemap includes all 30.

## Batch D — Notifications & Email Hygiene

**D1. Investigate empty `email_delivery_log` (last 72h)**
- Determine: cron not firing, Resend errors, or logging gap.
- Check `send-scheduled-emails` + `send-automated-messages` cron history and Resend account status.
- Fix root cause (re-enable cron, fix logger insert, or both).

**D2. Deduplicate Welcome templates**
- Identify duplicate "Welcome" automated_messages rows.
- Keep the canonical one (referenced by `trigger_welcome_email`), archive the rest.

## Batch E — Migration: react-helmet → react-helmet-async

**E1. Migrate 48 files** to `react-helmet-async`.
- Add `<HelmetProvider>` at app root.
- Replace `import { Helmet } from 'react-helmet'` everywhere.
- Removes the recurring HMR `removeChild` errors.

## Batch F — Storage & SDK Hardening

**F1. Tighten storage bucket LIST policies** (`avatars`, `message-attachments`, `contact-files`).
- Restrict LIST to owner / admin only; keep public READ on the public buckets.

**F2. Align Stripe SDK to v18.5.0** across all edge functions.

## Batch G — Final Verification Pass

After A–F:
- Re-run the audit queries.
- Generate `SMARTYGYM_POST_FIX_REPORT_<date>.md` showing before/after numbers for every issue.
- Confirm: 0 broken exercise links, 30/30 articles with SEO, 0 NULL renewal dates on paid subs, email log populated.

## Execution rules

- One batch at a time, in order A → G.
- After each batch: short status message with numbers proving the fix.
- If any batch surfaces a new blocker (e.g. Stripe key missing scope), I stop and ask before continuing.
- No new features added. No layout changes. Audit-driven repairs only.

## Files / systems touched

- `supabase/functions/delete-user-account/index.ts`
- `supabase/functions/batch-relink-exercises/*` (run only, no code change unless needed)
- `supabase/functions/sync-stripe-subscription/*` (used to backfill)
- `supabase/functions/seo-blog-generator/*` (run only)
- `supabase/functions/send-scheduled-emails/*`, `send-automated-messages/*` (debug)
- All 48 files using `react-helmet`
- Storage policy migration
- Stripe SDK version bumps in affected functions

## What I will NOT touch

- Workout/program content
- WOD generation logic
- UI layout, theme, colors
- Pricing
- Cron schedule times

