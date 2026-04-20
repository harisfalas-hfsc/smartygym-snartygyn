

# Full Website Audit — SmartyGym

I will run a complete, end-to-end audit of the entire platform and deliver a single written report. **No code changes** in this pass — audit only. Once you read the report, you decide what to fix and in what order.

## Scope (every area, nothing skipped)

1. **Access Control & Security**
   - Guest / Subscriber / Premium / Admin tier rules vs actual code paths
   - All RLS policies on every table (admin visibility, user privacy, public reads)
   - Edge function JWT checks, server-side purchase rejection for premium
   - Admin route protection, role checks, `has_role` usage
   - Supabase linter + security scan (leaked passwords, exposed schemas, etc.)

2. **Admin Back Office / Analytics**
   - Re-verify all dashboard counters after the recent fix (workouts 350, users 51, subs 3)
   - Revenue tab, Purchases tab, Growth tab, Completion tab, Popular tab, Website tab, Corporate tab, Shop tab, Social Analytics
   - Business report export numbers vs dashboard numbers
   - Cron jobs status, system health audit, edge function error rates

3. **Subscriptions, Payments, Stripe**
   - Live Stripe vs DB reconciliation (Manos / Maria / Applab + any others)
   - Renewal reminders, 7-day trial flow, auto-finalization, webhook health
   - Standalone purchases: hidden for premium, accessible to subscribers, RLS correct
   - Refund / cancel / expired-access read-only behavior

4. **Workouts & Training Programs**
   - Library count vs admin count vs public page count (the 350 / 353 issue)
   - Hidden / archived / WOD lifecycle integrity
   - Exercise linking (`{{exercise:ID:Name}}`) coverage and broken links
   - Image generation backlog (workouts/programs without images)
   - Format/density rules, naming uniqueness, duplicate detection

5. **WOD System**
   - Today's WOD bodyweight + equipment both live and matching
   - Archival lifecycle, all-or-none publishing, Stripe idempotency
   - Recent failures from the beginner/intermediate generation runs

6. **Messages & Notifications**
   - Web / Email / Push parity (the 100% parity standard)
   - Welcome onboarding sequence trigger health
   - Renewal reminder schedule
   - Pending content notifications queue (workouts/programs/articles)
   - Cron job health for `send-scheduled-notifications` and `send-automated-messages`

7. **Tools, Calendar, Goals, PAR-Q, Check-ins**
   - Workout Timer, Calorie Counter, Macro Calculator history sync
   - Native `.ics` export
   - Goal completion tracking (workouts + programs counters)
   - PAR-Q compliance gating
   - Check-in window (07–10 / 19–22) enforcement

8. **Community & Testimonials**
   - Leaderboards (workout + check-in + program) returning data
   - Testimonials premium gating + structured data
   - Comments / ratings RLS

9. **Blog & SEO**
   - Automated weekly blog generation health
   - JSON-LD, sitemaps (incl. image sitemap), social meta, favicon
   - Broken internal links / non-whitelisted links
   - React Helmet HMR risk check

10. **Public Site, UI, Mobile**
    - Every public route loads, no console errors
    - 1024px breakpoint, dark/light theme defaults
    - Stacked card layout, workout wrapper, carousel standards
    - Google Ads tag (`G-VCRTFQDY85`) firing
    - PWA / native-ready layer

11. **GDPR & Account Management**
    - Delete account cascades across all 31 tables
    - Download my data export integrity

## How I will do it (read-only)

- Database queries via `supabase--read_query` for every count and integrity check
- Supabase linter + security scan
- Edge function logs review for the last 24–72h on critical functions
- Stripe live data via `stripe--list_subscriptions`
- Code reads of every screen listed above to confirm logic matches DB rules
- Cross-check public page counts vs admin page counts vs raw DB

## Deliverable

A single structured **Audit Report** with this exact format, written to `/mnt/documents/SMARTYGYM_FULL_AUDIT_<date>.md` and summarized in chat:

For every area:
- ✅ **Working** — what's verified correct, with the number proving it
- ⚠️ **Warning** — works but inconsistent, mislabeled, or fragile
- 🔴 **Broken** — actual bug, with: where, why, impact, and exact fix
- 🟡 **Recommendation** — improvement, not a bug

At the end:
- **Severity-ranked fix list** (Critical → High → Medium → Low)
- **Estimated effort per fix** (single migration / single file / multi-file / requires plan)
- **Suggested fix order** so you can approve them one batch at a time instead of one giant change

## What this pass will NOT do

- No code edits
- No migrations
- No Stripe changes
- No content generation
- No WOD regeneration

You get the full picture first. Then you choose what gets fixed and when.

