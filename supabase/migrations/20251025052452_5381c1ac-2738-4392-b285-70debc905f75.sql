-- Fix the missing dates for the Gold subscription
UPDATE user_subscriptions 
SET 
  current_period_start = '2025-10-25T05:07:46.000Z',
  current_period_end = '2025-11-25T05:07:46.000Z'
WHERE user_id = '19f14d6b-4da2-4ac6-b3dd-bb20f29257b9';