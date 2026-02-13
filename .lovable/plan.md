

# Fix: Community Leaderboard Not Showing Free Users + Interaction Issues

## Root Cause Analysis

I investigated the database and found the real problem. The new user (Elsa) has a workout interaction row but `is_completed` is still `false` in the database -- even though she may have clicked the "Complete" button. Here's why:

### Problem 1: Upsert fails silently for free users

The `workout_interactions` table has an INSERT RLS policy that only allows free users to insert rows where `is_completed IS NOT TRUE AND is_favorite IS NOT TRUE AND rating IS NULL`. This was designed to prevent free users from interacting with premium content they haven't purchased.

However, the code uses **upsert** (INSERT ... ON CONFLICT DO UPDATE) to toggle completion, favorites, and ratings. In PostgreSQL, when an upsert is attempted:
- The INSERT WITH CHECK policy is evaluated first
- If it fails, the **entire operation fails** -- it does NOT fall through to the UPDATE path
- The code does not check for errors from the upsert, so the UI updates locally (shows "completed") but the database never changes
- On page reload, the true state (not completed) is shown

So when Elsa clicks "Mark as Complete", the UI briefly shows it as completed, but the database silently rejects the change. That's why she doesn't appear on the leaderboard.

### Problem 2: INSERT policy doesn't account for purchased content

The INSERT policy checks for premium subscription, admin role, and corporate membership -- but it does NOT check the `user_purchases` table. So even users who legitimately purchased (or received as a complimentary gift) a premium workout cannot fully interact with it at the database level.

### About Dashboard/Logbook for Free Users

Free users (subscribers) DO have access to the dashboard -- it's behind `ProtectedRoute` which only requires authentication, not premium status. The logbook tab is accessible to all authenticated users. However, the SmartyPlans comparison page incorrectly shows LogBook as "premium only" -- it should show as available to all authenticated users (at minimum for their purchased content).

## Fix Plan

### 1. Fix the INSERT RLS policy on `workout_interactions` (Database Migration)

Update the policy to also allow users who have purchased the content:

```sql
-- Add purchased content check to the INSERT policy
DROP POLICY "Users can insert workout interactions based on tier" ON workout_interactions;

CREATE POLICY "Users can insert workout interactions based on tier"
ON workout_interactions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Admins can do anything
    has_role(auth.uid(), 'admin'::app_role)
    -- Premium subscribers
    OR EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND status = 'active' AND plan_type IN ('gold', 'platinum'))
    -- Corporate admins
    OR EXISTS (SELECT 1 FROM corporate_subscriptions WHERE admin_user_id = auth.uid() AND status = 'active')
    -- Corporate members
    OR EXISTS (SELECT 1 FROM corporate_members cm JOIN corporate_subscriptions cs ON cm.corporate_subscription_id = cs.id WHERE cm.user_id = auth.uid() AND cs.status = 'active')
    -- Users who purchased this specific workout
    OR EXISTS (SELECT 1 FROM user_purchases WHERE user_id = auth.uid() AND content_id = workout_interactions.workout_id AND content_type = 'workout' AND content_deleted = false)
    -- Free users on free content (view-only interactions)
    OR (is_favorite IS NOT TRUE AND is_completed IS NOT TRUE AND rating IS NULL)
  )
);
```

### 2. Fix the same issue on `program_interactions` (Database Migration)

Apply the equivalent fix for programs too, adding a check for purchased programs.

### 3. Fix `WorkoutInteractions.tsx` -- use UPDATE instead of upsert for existing rows

Change the `toggleCompleted`, `toggleFavorite`, and `handleRating` functions to:
- First check if a row already exists (which it does, since `markAsViewed` creates it)
- If it exists, use UPDATE (which has a simpler RLS policy: `auth.uid() = user_id`)
- If it doesn't exist, use INSERT
- Also add proper error handling for the database operations

### 4. Fix `ProgramInteractions.tsx` -- same pattern

Apply the same update-vs-upsert fix for program interactions.

### 5. Fix `WorkoutInteractions.tsx` error handling

The current code silently ignores upsert failures. Add proper error checking so users see a meaningful error if something goes wrong.

## What This Fixes

- New users who receive complimentary workouts can mark them as completed, favorite them, and rate them
- Users who purchase standalone workouts/programs get full interaction parity with premium users
- Completed workouts from these users will appear on the community leaderboard
- The UI won't show false "completed" states that revert on page reload
