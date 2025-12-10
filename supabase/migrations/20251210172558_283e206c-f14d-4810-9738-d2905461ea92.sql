-- Drop the insecure public access policy
DROP POLICY IF EXISTS "Anyone can view visible rituals" ON daily_smarty_rituals;

-- Create policy for premium users (Gold/Platinum personal subscriptions)
CREATE POLICY "Premium users can view visible rituals"
ON daily_smarty_rituals FOR SELECT
USING (
  is_visible = true 
  AND (
    -- Personal premium subscription
    EXISTS (
      SELECT 1 FROM user_subscriptions
      WHERE user_subscriptions.user_id = auth.uid()
      AND user_subscriptions.status = 'active'
      AND user_subscriptions.plan_type IN ('gold', 'platinum')
    )
    OR
    -- Corporate admin
    EXISTS (
      SELECT 1 FROM corporate_subscriptions
      WHERE corporate_subscriptions.admin_user_id = auth.uid()
      AND corporate_subscriptions.status = 'active'
    )
    OR
    -- Corporate member
    EXISTS (
      SELECT 1 FROM corporate_members cm
      JOIN corporate_subscriptions cs ON cs.id = cm.corporate_subscription_id
      WHERE cm.user_id = auth.uid()
      AND cs.status = 'active'
    )
  )
);

-- Create policy for admins to view all rituals (for back office management)
CREATE POLICY "Admins can view all rituals"
ON daily_smarty_rituals FOR SELECT
USING (has_role(auth.uid(), 'admin'));