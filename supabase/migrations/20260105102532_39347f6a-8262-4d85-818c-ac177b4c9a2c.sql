-- Update workout_interactions INSERT policy to enforce tier restrictions
-- Subscribers can only record views, Premium users can do all interactions

-- First drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own workout interactions" ON workout_interactions;

-- Create new policy that allows:
-- 1. Admin users can insert any interaction
-- 2. Premium users can insert any interaction
-- 3. Non-premium: only 'viewed' allowed (no favorites, ratings, completion)
CREATE POLICY "Users can insert workout interactions based on tier"
ON workout_interactions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Admin users can insert any interaction
    has_role(auth.uid(), 'admin')
    OR
    -- Premium users can insert any interaction
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND plan_type IN ('gold', 'platinum')
    )
    OR
    -- Corporate admin users can insert any interaction
    EXISTS (
      SELECT 1 FROM corporate_subscriptions 
      WHERE admin_user_id = auth.uid() 
      AND status = 'active'
    )
    OR
    -- Corporate members can insert any interaction
    EXISTS (
      SELECT 1 FROM corporate_members cm
      JOIN corporate_subscriptions cs ON cm.corporate_subscription_id = cs.id
      WHERE cm.user_id = auth.uid() 
      AND cs.status = 'active'
    )
    OR
    -- Non-premium: only 'viewed' allowed (no favorites, ratings, completion)
    (is_favorite IS NOT TRUE AND is_completed IS NOT TRUE AND rating IS NULL)
  )
);

-- Update program_interactions INSERT policy with same logic
DROP POLICY IF EXISTS "Users can insert their own program interactions" ON program_interactions;

CREATE POLICY "Users can insert program interactions based on tier"
ON program_interactions FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Admin users can insert any interaction
    has_role(auth.uid(), 'admin')
    OR
    -- Premium users can insert any interaction
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND plan_type IN ('gold', 'platinum')
    )
    OR
    -- Corporate admin users can insert any interaction
    EXISTS (
      SELECT 1 FROM corporate_subscriptions 
      WHERE admin_user_id = auth.uid() 
      AND status = 'active'
    )
    OR
    -- Corporate members can insert any interaction
    EXISTS (
      SELECT 1 FROM corporate_members cm
      JOIN corporate_subscriptions cs ON cm.corporate_subscription_id = cs.id
      WHERE cm.user_id = auth.uid() 
      AND cs.status = 'active'
    )
    OR
    -- Non-premium: only 'viewed' allowed (no favorites, ratings, completion, ongoing)
    (is_favorite IS NOT TRUE AND is_completed IS NOT TRUE AND is_ongoing IS NOT TRUE AND rating IS NULL)
  )
);