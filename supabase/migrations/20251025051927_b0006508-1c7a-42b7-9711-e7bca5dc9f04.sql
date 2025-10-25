-- Manually update the subscription for the current user with the correct Gold plan info
UPDATE user_subscriptions 
SET 
  plan_type = 'gold',
  status = 'active',
  stripe_subscription_id = 'sub_1SLzbgIxQYg9inGKShRrDVSO',
  current_period_start = '2025-10-25T05:07:46.000Z',
  current_period_end = '2025-11-25T05:07:46.000Z',
  cancel_at_period_end = false,
  updated_at = NOW()
WHERE user_id = '19f14d6b-4da2-4ac6-b3dd-bb20f29257b9';