-- 1. Add subscription source tracking columns to user_subscriptions
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_source TEXT DEFAULT 'stripe';

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS granted_by UUID;

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS grant_notes TEXT;

-- 2. Backfill existing data based on stripe_subscription_id presence
UPDATE user_subscriptions 
SET subscription_source = 'admin_grant'
WHERE stripe_subscription_id IS NULL 
  AND status = 'active' 
  AND plan_type IN ('gold', 'platinum');

UPDATE user_subscriptions 
SET subscription_source = 'stripe'
WHERE stripe_subscription_id IS NOT NULL;

-- 3. Drop existing INSERT policy for smarty_checkins if exists
DROP POLICY IF EXISTS "Users can insert their own checkins" ON smarty_checkins;

-- 4. Create premium-only INSERT policy for smarty_checkins (database-level enforcement)
CREATE POLICY "Premium users can insert their own checkins"
ON smarty_checkins FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM user_subscriptions 
    WHERE user_subscriptions.user_id = auth.uid() 
    AND status = 'active' 
    AND plan_type IN ('gold', 'platinum')
  )
);