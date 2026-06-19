# SmartyGym Launch Checklist

## Phase 1: Infrastructure & Security
- [ ] **Secrets Audit:**
    - [ ] `STRIPE_SECRET_KEY` (Live mode) is set in Supabase.
    - [ ] `STRIPE_WEBHOOK_SECRET` (Live mode) is set in Supabase.
    - [ ] `RESEND_API_KEY` is set and verified with a custom sending domain.
    - [ ] `SUPABASE_SERVICE_ROLE_KEY` is not used in any client-side code.
    - [ ] Check `.env` and `.env.local` are definitely not in the Git history (`git filter-repo` if found).
- [ ] **Database Integrity:**
    - [ ] All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
    - [ ] `public.has_premium_subscription()` handles admin bypass and legacy tiers.
    - [ ] `public.user_has_active_premium_access()` handles corporate memberships.
    - [ ] Migrations are up to date (`supabase migration list`).
    - [ ] `user_roles` table populated with the initial admin user.
- [ ] **Performance:**
    - [ ] Database indexes exist for all common lookup columns (e.g., `user_id`, `stripe_customer_id`).
    - [ ] Supabase project is scaled correctly (at least Pro plan for production traffic).

## Phase 2: Payment & Financials
- [ ] **Stripe Products:**
    - [ ] €89.99 Lifetime Premium product is "Live" in Stripe.
    - [ ] Price ID `price_1ThP4MIxQYg9inGKAUQEJ0tD` verified.
    - [ ] Legacy products (Gold/Platinum) are archived but still exist for webhook mapping.
- [ ] **Webhook Reliability:**
    - [ ] Webhook endpoint `v1/stripe-webhook` is active and 200-OKing test events.
    - [ ] Idempotency logic (`stripe_webhook_events`) is working correctly.
    - [ ] Refund logic (`charge.refunded`) revokes access immediately.
- [ ] **Checkout Experience:**
    - [ ] Success redirect (`/payment-success`) triggers the local storage refresh.
    - [ ] Cancel redirect returns user to the correct pricing state.
    - [ ] Standalone purchase for workouts verified end-to-end.
    - [ ] Standalone purchase for programs verified end-to-end.
- [ ] **B2B / Corporate:**
    - [ ] Corporate checkout creates `corporate_subscriptions` record.
    - [ ] Corporate Admin can successfully add/remove members.
    - [ ] Member limit is enforced by the database trigger/function.

## Phase 3: Mobile & PWA Readiness
- [ ] **Capacitor Configuration:**
    - [ ] `appId` matches the Apple/Google developer accounts (`com.smartygym.app`).
    - [ ] `appName` is correctly set to "SmartyGym".
    - [ ] Splash screens and icons are generated for all densities.
- [ ] **Native Integration:**
    - [ ] Mobile checkout uses `Browser.open` to bypass App Store IAP fees.
    - [ ] Push notification registration works on real devices.
    - [ ] Safe-area insets are applied to the top and bottom of all main layouts.
- [ ] **PWA Features:**
    - [ ] Service worker is active and caching core assets.
    - [ ] "Add to Home Screen" prompt displays correctly on Chrome/Android.
    - [ ] Offline fallback page is functional.

## Phase 4: Content & SEO
- [ ] **Workout Library:**
    - [ ] All workouts have valid thumbnails (no 404s).
    - [ ] Exercise demo videos are playable.
    - [ ] Workout durations are estimated and displayed.
- [ ] **SEO & Metadata:**
    - [ ] `generate-sitemap` run and verified.
    - [ ] Robots.txt allows indexing of public assets.
    - [ ] JSON-LD structured data is present on Workout and Program pages.
    - [ ] Meta descriptions are unique for major landing pages.
- [ ] **Internal Search:**
    - [ ] Search indexes are updated.
    - [ ] Filtering by equipment/muscle group/difficulty is functional.

## Phase 5: Legal & Support
- [ ] **User Policies:**
    - [ ] Terms and Conditions reflect the Lifetime Membership policy (no refunds after X days, etc.).
    - [ ] Privacy Policy explains cookie usage and Stripe data sharing.
- [ ] **Support Infrastructure:**
    - [ ] `send-contact-email` function is working.
    - [ ] Contact form is connected and sends to `hello@smartygym.com`.
    - [ ] User Account Deletion is fully automated and deletes Stripe customers.
- [ ] **Analytics:**
    - [ ] Google Analytics or Plausible connected.
    - [ ] Custom event tracking for "Begin Checkout" and "Purchase Complete".

## Phase 6: Final Smoke Test
- [ ] Sign up as a new user.
- [ ] Complete the onboarding flow.
- [ ] Purchase Lifetime Premium.
- [ ] Verify access to "Member Only" workouts.
- [ ] Start a workout, log reps, and complete it.
- [ ] Verify activity appears on the Dashboard.
- [ ] Request a password reset email.
- [ ] Delete the test account.

## [GO / NO-GO]
- [ ] Technical Lead Approval
- [ ] Product Owner Approval (Haris Falas)
- [ ] Content Quality Audit Approval
