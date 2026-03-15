

## Problem

The `cancel_at_period_end` field exists in the `user_subscriptions` table and is correctly synced from Stripe (via webhooks, check-subscription, and the admin self-heal sync). However, this information is **not surfaced in the admin User Management panel**. You currently have no way to see if a user like Manos has canceled their subscription from the admin view.

## What Already Works

- Stripe webhook updates `cancel_at_period_end` when a user cancels
- The `check-subscription` function syncs it on each user visit
- The user's own dashboard shows "Cancels at period end" badge correctly
- The database column is populated and accurate

## What's Missing

The data pipeline from database to admin UI has two gaps:

1. **Edge function (`get-users-with-emails`)** — fetches subscriptions but does NOT include `cancel_at_period_end` in the response payload
2. **Admin hook (`useAdminUserData`)** — does not map `cancel_at_period_end` to the user data interface
3. **Admin UI (`UsersManager.tsx`)** — no visual indicator for cancellation status on user cards

## Plan

### 1. Update the `get-users-with-emails` edge function
- Add `cancel_at_period_end` to the subscription select query and include it in the combined response for each user

### 2. Update `useAdminUserData` hook
- Add `cancel_at_period_end` to the `AdminUserData` interface
- Map it from the API response

### 3. Update `UsersManager.tsx` user cards
- Show an orange "Cancels at period end" badge next to the status badge when `cancel_at_period_end` is `true` and the subscription is still active
- This makes it immediately visible which paying users have scheduled cancellations vs those who will auto-renew

## Result

For a user like Manos who has an active trial/subscription, you'll see either:
- **Active** (green) — will auto-renew
- **Active** (green) + **Cancels at period end** (orange) — canceled, access expires at period end

