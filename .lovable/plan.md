## Clear production health audit answer

I checked the current backend data, payment records, code paths, logs, and console/network snapshots in read-only mode.

### Current status

| Area | Status | Finding |
|---|---:|---|
| Workout of the Day | Working now | Today’s two WODs are visible, active, and marked as WOD for 2026-04-28. |
| WOD payment products | Working now | Both WOD Stripe products now have the correct default price attached. |
| Visible paid workouts | Working now | 335 visible paid workouts have product + price IDs. 0 visible paid workouts are missing payment links. |
| Visible paid programs | Working now | 25 visible paid programs have product + price IDs. 0 visible paid programs are missing payment links. |
| Membership database | Working | 17 subscription rows: 16 active, 1 canceled. Active includes 2 Gold and 1 Platinum paid/premium rows plus free active users. |
| Stripe subscriptions | Working from Stripe side | Stripe currently shows 1 active subscription. |
| Tools pages | Working text corrected | The checked tool pages now say “Smarty Tools — Free to Use”, not “Smart Tools”. |
| Login/reset password | Mostly working | Login, Google login, forgot password, and reset-password page exist. One code-order issue should be cleaned up. |
| Notifications queue | Healthy right now | Pending content notifications: 0. Scheduled notification/email queues: empty. Recent notification functions returned 200. |
| Backend function failures | No current 4xx/5xx in recent edge request logs | Recent backend function request logs show no failed HTTP statuses. |
| Console errors | One UI accessibility warning | Browser snapshot shows a DialogContent warning in the user dashboard check-in dialogs because DialogTitle/DialogDescription are missing. This is not a payment/WOD failure, but should be fixed. |
| Security/RLS | Needs hardening | Public SELECT policies expose all workouts/programs, including premium content, at database level. The UI may still gate content, but database policies are too open for paid content protection. |
| Database triggers | Serious issue found | The database reports no active triggers, even though functions exist for profile creation, notifications, image repair, workout validation, etc. This can cause silent workflow failures. |

## What likely caused the recent WOD failure

The WOD rows were generated, but the publishing/payment state was incomplete:

- the WOD content existed,
- it was hidden/unpublished,
- the Stripe products existed,
- but the Stripe products were missing the required default price connection.

That specific issue was already repaired. Today’s rows are now live:

- `Leg Anchor Pull` — BODYWEIGHT — visible WOD — product and price connected
- `Squat Row Hybrid` — EQUIPMENT — visible WOD — product and price connected

## Important risks I found

### 1. Database triggers are missing

This is the biggest red flag.

The schema has many trigger functions, but the database currently reports zero triggers. That means some automatic behavior may not fire reliably, including things like:

- automatic profile creation after signup,
- welcome email/profile workflow,
- content notification queueing,
- workout/program image repair queueing,
- workout format/integrity enforcement.

This does not mean every page is broken today, but it explains why “one thing after another” can happen: several systems depend on automation that may not actually be attached.

### 2. Premium content database access is too open

There are public policies named:

- `Public can view all workouts`
- `Public can view all programs`

with `USING true`.

That means the database allows public reads of all workout/program rows. The frontend may still hide/prompt purchase, but paid content protection should not rely only on frontend logic.

### 3. User dashboard dialogs need accessibility cleanup

The console warning is from these dashboard dialogs:

- Morning check-in dialog
- Night check-in dialog

They render `DialogContent` without a `DialogTitle` / `DialogDescription`. This is not a production outage, but it should be fixed because it is a real console warning.

### 4. Auth state listener order should be cleaned up

The main auth page calls `getSession()` before registering `onAuthStateChange`. Best practice is listener first, then session check. It may still work, but cleaning it up reduces edge-case login redirect issues.

## Stabilization plan for approval

### Step 1: Restore critical database triggers

Create a migration that safely recreates missing triggers for existing trigger functions, including:

- profile creation on signup,
- welcome/profile email workflow where appropriate,
- workout/program notification queueing,
- workout/program image repair queueing,
- workout format enforcement,
- WOD/content integrity validation.

The migration will use `DROP TRIGGER IF EXISTS` then `CREATE TRIGGER` so it is safe to re-run.

### Step 2: Harden paid/free content access

Replace overly broad public read policies for workouts/programs so:

- visitors can still browse visible free metadata/content,
- premium content is readable only by premium users, admins, or users who purchased that exact item,
- admin management policies stay role-protected,
- the app’s existing browsing experience is preserved as much as possible.

This must be done carefully because changing RLS can affect public pages.

### Step 3: Add stronger WOD production guardrails

Add/verify safeguards so a WOD cannot be considered successfully published unless:

- expected WOD count is present,
- rows are visible,
- both variants are active for the correct date,
- each paid WOD has both product and price IDs,
- Stripe product `default_price` matches the stored price ID,
- the state table is updated only after all checks pass.

### Step 4: Fix current console warning

Update the dashboard check-in dialogs to include accessible titles/descriptions, using hidden titles if the visual design should remain unchanged.

### Step 5: Clean up auth session initialization

Refactor the auth page so the auth listener is registered before the initial session check. Keep the existing login, signup, Google login, trial checkout, and avatar setup behavior.

### Step 6: Add an admin-facing production health summary

Improve the existing health audit/reporting so it explicitly flags:

- missing WOD for today,
- generated-but-hidden WODs,
- payment products missing default price,
- missing database triggers,
- broken paid content payment links,
- notification queue backlog,
- recent backend function 4xx/5xx errors.

## Technical details

Files likely involved:

- `src/pages/UserDashboard.tsx`
- `src/pages/Auth.tsx`
- `supabase/functions/wod-payment-health-report/index.ts`
- `supabase/functions/run-system-health-audit/index.ts`
- `supabase/functions/generate-workout-of-day/index.ts`
- new database migration for triggers and RLS policy hardening

Database objects likely involved:

- `admin_workouts`
- `admin_training_programs`
- `profiles`
- `pending_content_notifications`
- `user_subscriptions`
- `user_purchases`
- `user_roles`
- `workout_of_day_state`
- `wod_generation_runs`

## My recommendation

Approve this plan. The website is working right now for the checked critical production paths, but I do not want to leave the missing triggers and broad paid-content read policies untouched. Those are structural risks, not cosmetic issues.