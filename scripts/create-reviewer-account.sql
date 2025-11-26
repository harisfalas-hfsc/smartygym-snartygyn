-- ============================================================================
-- APP STORE REVIEWER TEST ACCOUNT SETUP
-- ============================================================================
-- This script creates a premium test account for iOS/Android app store reviewers
-- with sample activity data for a realistic testing experience.
--
-- Account Credentials (for reviewers):
-- Email: reviewer@smartygym.com
-- Password: AppReview2025!
--
-- IMPORTANT: This account should ONLY be used for app store review purposes.
-- ============================================================================

-- ============================================================================
-- STEP 1: MANUAL USER CREATION (REQUIRED FIRST)
-- ============================================================================
-- You MUST create this user manually through the signup flow FIRST:
-- 1. Visit https://smartygym.com/auth
-- 2. Click "Sign Up"
-- 3. Enter:
--    Email: reviewer@smartygym.com
--    Password: AppReview2025!
-- 4. Complete email verification (if required)
-- 5. Then proceed to Step 2 below
-- ============================================================================

-- ============================================================================
-- STEP 2: GRANT PREMIUM PLATINUM ACCESS (Run after user creation)
-- ============================================================================
-- This gives the reviewer full access to all premium content without requiring payment.

INSERT INTO public.user_subscriptions (
  user_id, 
  plan_type, 
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
SELECT 
  id,
  'platinum',              -- Highest tier for comprehensive testing
  'active',
  NOW(),
  NOW() + INTERVAL '1 year',  -- Long expiration so reviewers don't lose access
  false
FROM auth.users 
WHERE email = 'reviewer@smartygym.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  plan_type = 'platinum',
  status = 'active',
  current_period_end = NOW() + INTERVAL '1 year',
  cancel_at_period_end = false,
  updated_at = NOW();

-- Verify subscription was created
SELECT 
  u.email,
  s.plan_type,
  s.status,
  s.current_period_end
FROM user_subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'reviewer@smartygym.com';

-- ============================================================================
-- STEP 3: ADD SAMPLE WORKOUT INTERACTIONS (Makes dashboard look realistic)
-- ============================================================================
-- Add 5 completed workouts to show activity history

INSERT INTO workout_interactions (
  user_id,
  workout_id,
  workout_name,
  workout_type,
  is_favorite,
  is_completed,
  has_viewed,
  rating,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  w.id,
  w.name,
  w.type,
  (RANDOM() > 0.6)::boolean,  -- 40% chance of favorite
  true,                       -- Mark as completed
  true,                       -- Has viewed
  FLOOR(RANDOM() * 2 + 4)::int, -- Random rating 4-5 stars
  NOW() - (FLOOR(RANDOM() * 30) || ' days')::interval,  -- Random date within last 30 days
  NOW() - (FLOOR(RANDOM() * 30) || ' days')::interval
FROM admin_workouts w
WHERE w.is_premium = true
ORDER BY RANDOM()
LIMIT 5
ON CONFLICT (user_id, workout_id) DO NOTHING;

-- ============================================================================
-- STEP 4: ADD SAMPLE TRAINING PROGRAM INTERACTIONS
-- ============================================================================
-- Add 2 ongoing training programs to show structured training engagement

INSERT INTO program_interactions (
  user_id,
  program_id,
  program_name,
  program_type,
  is_favorite,
  is_ongoing,
  is_completed,
  has_viewed,
  rating,
  created_at,
  updated_at
)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  p.id,
  p.name,
  p.category,
  (RANDOM() > 0.5)::boolean,  -- 50% chance of favorite
  true,                       -- Mark as ongoing
  false,                      -- Not completed yet
  true,                       -- Has viewed
  NULL,                       -- No rating until completed
  NOW() - (FLOOR(RANDOM() * 14) || ' days')::interval,  -- Started within last 2 weeks
  NOW() - (FLOOR(RANDOM() * 14) || ' days')::interval
FROM admin_training_programs p
WHERE p.is_premium = true
ORDER BY RANDOM()
LIMIT 2
ON CONFLICT (user_id, program_id) DO NOTHING;

-- ============================================================================
-- STEP 5: ADD SAMPLE ACTIVITY LOG ENTRIES
-- ============================================================================
-- Populate activity log for dashboard calendar and analytics

INSERT INTO user_activity_log (
  user_id,
  activity_date,
  action_type,
  content_type,
  item_id,
  item_name,
  created_at
)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  (NOW() - (generate_series(1, 15) || ' days')::interval)::date,  -- 15 days of activity
  CASE 
    WHEN generate_series % 3 = 0 THEN 'completed'
    WHEN generate_series % 3 = 1 THEN 'started'
    ELSE 'viewed'
  END,
  CASE 
    WHEN generate_series % 2 = 0 THEN 'workout'
    ELSE 'training_program'
  END,
  'sample-' || generate_series::text,
  'Sample Activity ' || generate_series::text,
  NOW() - (generate_series || ' days')::interval
FROM generate_series(1, 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: ADD SAMPLE FITNESS CALCULATOR HISTORY
-- ============================================================================
-- Add 1RM and BMR calculator results for complete profile

-- 1RM Calculator history
INSERT INTO onerm_history (
  user_id,
  exercise_name,
  weight_lifted,
  reps,
  one_rm_result,
  created_at
)
VALUES
(
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  'Bench Press',
  80,
  8,
  100,
  NOW() - INTERVAL '5 days'
),
(
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  'Squat',
  100,
  6,
  116,
  NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- BMR Calculator history
INSERT INTO bmr_history (
  user_id,
  age,
  gender,
  weight,
  height,
  bmr_result,
  created_at
)
VALUES
(
  (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com'),
  30,
  'male',
  75,
  175,
  1780,
  NOW() - INTERVAL '7 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to confirm everything was created correctly

-- 1. Verify user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'reviewer@smartygym.com';

-- 2. Verify premium subscription
SELECT plan_type, status, current_period_end 
FROM user_subscriptions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');

-- 3. Verify workout interactions
SELECT COUNT(*) as workout_count
FROM workout_interactions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');

-- 4. Verify program interactions
SELECT COUNT(*) as program_count
FROM program_interactions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');

-- 5. Verify activity log
SELECT COUNT(*) as activity_count
FROM user_activity_log 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');

-- ============================================================================
-- CLEANUP (ONLY IF NEEDED - Use after app review is complete)
-- ============================================================================
-- UNCOMMENT and run these queries to remove the reviewer account:

/*
-- Delete all related data
DELETE FROM user_activity_log WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');
DELETE FROM workout_interactions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');
DELETE FROM program_interactions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');
DELETE FROM onerm_history WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');
DELETE FROM bmr_history WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');
DELETE FROM user_subscriptions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reviewer@smartygym.com');

-- Delete the user (requires Supabase auth admin privileges)
-- This must be done manually via Supabase Dashboard > Authentication > Users
-- OR via Supabase Admin API
*/

-- ============================================================================
-- NOTES FOR APP STORE SUBMISSION
-- ============================================================================
-- When submitting to Apple App Store or Google Play Store:
--
-- 1. Include these credentials in "App Review Information":
--    - Username: reviewer@smartygym.com
--    - Password: AppReview2025!
--
-- 2. Add a note to reviewers:
--    "This is a premium Platinum account with full access to all features.
--    The account includes sample workout history and activity data for
--    comprehensive testing. All payment features use Stripe test mode."
--
-- 3. Ensure Stripe is in TEST mode so reviewers can test purchases safely.
--
-- 4. Keep this account active until app is approved.
--
-- 5. After approval, you can optionally keep it for ongoing updates.
-- ============================================================================
