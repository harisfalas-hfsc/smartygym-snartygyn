## Plan: clean admin analytics to match the current SmartyGym business

### Goal
Make the admin panel stop showing obsolete business logic like Gold, Platinum, Trial, Lifetime-as-plan, fake complimentary counts, DB-estimated revenue, and empty DB purchase history.

The admin panel should reflect the current business:

- One membership: **SmartyGym Premium**
- Standalone purchases: **workouts** and **training programs**
- Revenue truth: **Stripe payments only**, filtered by SmartyGym product metadata
- Free users are users, not subscriptions
- Admin-granted access is manual access, not revenue and not “20 complimentary subscribers”

### What I found
- Revenue has been partially fixed, but `RevenueAnalytics` still loads every active subscription row, including `plan_type = free`, so free rows can be shown as “free subscriptions”. That is why the numbers feel fake.
- The users screen still contains `Trial`, old tier grouping, and legacy wording.
- Growth analytics still groups subscriptions by raw `plan_type`, so old plans can appear.
- Purchase analytics still reads `user_purchases`, but that table currently has **0 rows**, while real payments are in Stripe.
- The business report still mentions lifetime/legacy premium subscribers and uses stale revenue field names.
- Stripe revenue function still contains old known product IDs for legacy lifetime/gold/platinum. Since SmartyGym products are tagged in Stripe metadata, the cleaner rule should be metadata-first.

### Implementation steps

#### 1. Create one canonical admin business model helper
Add/extend shared admin analytics helpers so every admin screen uses the same rules:

- `isCurrentPremiumSubscription(row)`
  - active paid Premium only when it has Stripe billing evidence and is not an admin grant
- `isManualPremiumAccess(row)`
  - active admin/manual access, shown separately as manual access
- `isFreeUser(row)`
  - free account, not counted as subscription
- `normalizePlanLabel(row)`
  - `premium`, `lifetime`, old `gold`, old `platinum`, and `legacy_premium` display as **Premium Access** only when still active
  - never display Gold/Platinum as active plan options
- `normalizeRevenueCategory(payment)`
  - Premium Membership
  - Standalone Workout
  - Standalone Training Program
  - Other SmartyGym Product, only if metadata says so

#### 2. Clean Stripe revenue source of truth
Update `get-stripe-revenue` so revenue inclusion is based on Stripe metadata:

- Count charges only when product or charge metadata identifies SmartyGym, e.g. `project=SMARTYGYM` / equivalent existing tag.
- Use Stripe product metadata to classify:
  - Premium membership
  - Standalone workout
  - Standalone training program
- Stop presenting legacy Gold/Platinum/Lifetime as active revenue categories.
- Keep refunds/net collected logic.
- Keep admin-only security.
- Return clearer fields:
  - `totalCollected`
  - `totalRefunded`
  - `paymentCount`
  - `byCategory`
  - `payments`
  - `excludedNonSmartyGym`
  - `unmatchedSmartyGymMetadataWarnings`

#### 3. Redesign Revenue Analytics around real Stripe payments
Update `RevenueAnalytics` to show:

- **Total collected**: Stripe net collected
- **Premium membership revenue**: Stripe payments classified as Premium
- **Standalone workout revenue**
- **Standalone training program revenue**
- **Refunds**
- **Payment count**

Remove or hide misleading items:

- “DB Estimate” column
- “free subscriptions” in Premium Memberships
- old plan filters that imply multiple membership tiers
- standalone revenue from `user_purchases`
- corporate/personal-training revenue sections unless Stripe metadata returns actual current SmartyGym payments for them

Add functional controls:

- Refresh Stripe revenue
- Export filtered Stripe payments CSV
- Filter by Premium / Workout / Training Program
- Search by email, product, or charge ID
- Date range filter applied to Stripe payments client-side from returned payments

#### 4. Clean Purchase Analytics
Make Purchase Analytics read from Stripe truth instead of `user_purchases` revenue.

It should show:

- Standalone workouts sold
- Standalone training programs sold
- Standalone revenue from Stripe
- Top purchased standalone items
- Top standalone customers
- Average order value

If there are no standalone Stripe payments, it should clearly show zero instead of pretending the DB purchase table is the business source.

#### 5. Clean Users Management
Update `UsersManager`:

- Remove **Trial** filter and Trial stats card.
- Remove old Gold/Platinum/Lifetime plan concepts from filters and visible sorting.
- Replace filters with current options:
  - All users
  - Free users
  - Paid Premium
  - Manual Premium Access
  - Standalone Purchase Only
  - Admins
  - Corporate, only if still needed by existing admin tools
- Update user cards:
  - Paid Premium = Stripe active Premium
  - Manual Premium Access = admin/manual access, not revenue
  - Free = no premium and no standalone purchases
  - Purchase Only = standalone purchase but no active premium
- Change summary cards to:
  - Total users
  - Paid Premium
  - Manual Premium Access
  - Free users
  - Purchase-only users
  - Admins

#### 6. Clean User Detail Modal
Update user details so it no longer displays old plan branding:

- Show “Premium Access” instead of Lifetime/Gold/Platinum.
- Show “Paid via Stripe” or “Manual admin access”.
- Payment history should show real Stripe invoices/payments when available.
- DB purchases tab should be renamed or clarified as “Standalone Access Records” if it is not payment history.
- Keep Stripe sync/manage buttons for real paid users.

#### 7. Clean Growth Analytics
Update `GrowthAnalytics`:

- Remove raw plan distribution by `plan_type`.
- Show current buckets only:
  - Free users
  - Paid Premium
  - Manual Premium Access
  - Purchase-only users
- Keep real user growth from profiles.
- Add conversion metrics from Stripe truth where possible:
  - registered users to paying customers
  - registered users to paid premium

#### 8. Clean Popular Analytics
Keep Popular based on real usage interactions, but tighten it:

- Use only current visible workouts/programs where possible.
- Keep separate views for workouts and programs.
- Make labels clear: popular means usage engagement, not sales.
- Export CSV remains.

#### 9. Clean dashboard overview and business report
Update `AnalyticsDashboard` and `BusinessReportExport`:

- Remove legacy/lifetime/gold/platinum wording.
- Remove complimentary/free subscription language that counts free rows as subscriptions.
- Revenue in reports comes only from Stripe truth.
- Business report sections use current buckets only.
- If a number cannot be verified from Stripe or current database rules, show zero or “not available”, not an estimate.

#### 10. Data handling policy
I will not delete payment or user history.

Instead:

- Old rows remain for audit/access safety.
- Admin analytics will ignore obsolete rows unless they represent real current Premium access or real Stripe payments.
- Free subscription rows will not be counted as subscriptions.
- Manual/admin grants will be counted only as manual access, never revenue.

#### 11. Verification
After implementation:

- Run TypeScript verification.
- Run targeted searches to confirm no admin UI still exposes Gold/Platinum/Trial as current filters or labels.
- Verify dashboard logic against read-only database aggregates.
- Verify Stripe revenue endpoint still requires admin auth and returns Stripe-only revenue.
- Use the live preview/admin page where possible to confirm the updated labels and filters render correctly.