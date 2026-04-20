
Fix the admin analytics by aligning every count with the same business rules the live product uses.

## What is already verified

### Workouts
The mismatch is real and explainable:

- `admin_workouts` total rows: 353
- visible rows: 352
- hidden rows: 1
- active WOD rows: 2
- visible non-WOD library workouts: 350

So:
- Admin Analytics currently shows **353** because it counts all workout rows
- Smarty Workouts page shows **350** because it excludes:
  - the 2 active WOD rows
  - the 1 hidden row

The current card label says “Available workouts”, but the query is not using the same “available in library” rules.

### Subscriptions / users
Current backend numbers:
- profiles: 54
- active non-free subscribers: 3
- paid premium subscribers: 1
- complimentary/manual premium subscribers: 2
- free or inactive subscription rows: 13
- profiles with no subscription row at all: 38

So the current **Free Users = 13** card is also misleading if it means “non-premium users”.  
The real non-premium account count is **54 - 3 = 51**.

### Other counts checked
- programs: 28 visible, 28 total
- rituals: 140 visible, 140 total
- check-ins: 25
- comments: 11
- standalone purchases: 0
- corporate active: 1 manual, 0 paid
- website raw visit rows: 9,934

### Website analytics inconsistency
The overview card uses a raw `social_media_analytics` count, but the Website Analytics tab uses filtered logic/RPC that removes preview traffic, bots, crawlers, Lovable noise, etc. Those two can disagree.

### Extra UI issue found
`ShopAnalytics` exists as a tab panel but has **no tab trigger**, so that analytics page is currently unreachable from the UI.

---

## Implementation plan

### 1) Centralize analytics definitions
Create one shared admin analytics source of truth so all screens use the same counting rules.

Canonical definitions:
- **availableWorkouts** = `admin_workouts` where `is_visible != false` and not active WOD
- **visibleWorkoutsIncludingWOD** = `admin_workouts` where `is_visible != false`
- **activeWODs** = `is_workout_of_day = true`
- **hiddenWorkouts** = `is_visible = false`
- **availablePrograms** = visible programs only
- **availableRituals** = visible rituals only
- **activePremiumSubscribers** = active `gold|platinum`
- **paidSubscribers** = active premium with `stripe_subscription_id`
- **manualSubscribers** = active premium without `stripe_subscription_id`
- **nonPremiumUsers** = total profiles minus distinct active premium users
- **websiteVisitors** = filtered website analytics, not raw rows

### 2) Fix `AnalyticsDashboard.tsx`
Update the top cards so they reflect the real product rules:

- **Total Workouts** → use library count (**350**) instead of all rows
- change subtitle to something explicit like:
  - “Library workouts”
  - or “350 library • 2 active WOD • 1 hidden”
- **Active Subscribers** subtitle should not say “Paid memberships” if the value includes complimentary/manual
- **Free Users** should use non-premium accounts (**51** with current data), not only rows in `user_subscriptions`
- **Website Visitors** should use the same filtered logic as the Website Analytics tab

### 3) Fix `BusinessReportExport.tsx`
Make the export use the same exact metrics as the dashboard:
- same workout/program/ritual visibility rules
- same premium vs paid/manual definitions
- same filtered website visitor logic
- no mixing of “all-time Stripe total” with period-based standalone numbers unless labels clearly say so

### 4) Fix revenue screens for time-range correctness
Audit and correct:
- `RevenueAnalytics.tsx`
- `CorporateAnalytics.tsx`

Right now they filter subscriptions by `created_at` inside the selected window, which can undercount active recurring revenue. Update them so the time-based numbers follow one clear rule:
- either “new sales created in period”
- or “active revenue overlapping the period”

The labels and calculations must match exactly. For admin reporting, the better default is overlap/current-active logic.

### 5) Align website/social analytics
Audit and standardize:
- `WebsiteAnalytics.tsx`
- `SocialMediaAnalytics.tsx`

Apply the same traffic exclusions everywhere:
- preview traffic
- Lovable traffic
- bots/crawlers/spiders
- common external scrapers

This prevents the overview card, Website tab, and Social analytics from showing different visit totals for the same period.

### 6) Restore the missing Shop analytics entry point
In `AnalyticsDashboard.tsx`, add the missing `TabsTrigger` for the existing `shop` tab so the screen is actually reachable.

---

## Files to update

- `src/components/admin/AnalyticsDashboard.tsx`
- `src/components/admin/analytics/BusinessReportExport.tsx`
- `src/components/admin/RevenueAnalytics.tsx`
- `src/components/admin/analytics/CorporateAnalytics.tsx`
- `src/components/admin/analytics/WebsiteAnalytics.tsx`
- `src/components/admin/SocialMediaAnalytics.tsx`

Likely also add:
- a shared helper such as `src/lib/admin-analytics.ts` or similar, to avoid duplicated counting logic

---

## Expected result after the fix

With current data, the main overview should read consistently:

- Total Users: 54
- Active Subscribers: 3
- Paid Subscribers: 1
- Complimentary Premium: 2
- Free / Non-Premium Users: 51
- Total Workouts: 350 library workouts
- Programs: 28
- Rituals: 140
- Check-ins: 25
- Comments: 11
- Standalone purchases: 0
- Corporate active: 1 manual, 0 paid

And the Workout Analytics card will finally match the public Smarty Workouts page.

---

## Verification after implementation

After the fix, verify one by one:

1. Admin Analytics overview cards
2. Revenue tab
3. Purchases tab
4. Growth tab
5. Completion tab
6. Popular tab
7. Website tab
8. Corporate tab
9. Social analytics page
10. Business report export
11. Smarty Workouts page count vs admin workout count labels

Pass condition:
- no mislabeled totals
- no raw-vs-filtered visitor mismatch
- no library-vs-WOD mismatch
- no free-user undercount
- no hidden analytics tabs
