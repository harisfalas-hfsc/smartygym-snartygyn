-- Drop existing INSERT policy on user_activity_log
DROP POLICY IF EXISTS "Users can insert their own activity log" ON user_activity_log;

-- Create premium-only INSERT policy for user_activity_log (LogBook feature)
CREATE POLICY "Premium users can insert activity log entries"
ON user_activity_log FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    -- Admin bypass
    public.has_role(auth.uid(), 'admin')
    OR
    -- Premium users (gold/platinum subscription)
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active' 
      AND plan_type IN ('gold', 'platinum')
    )
    OR
    -- Corporate premium members
    EXISTS (
      SELECT 1 FROM corporate_members cm
      JOIN corporate_subscriptions cs ON cm.corporate_subscription_id = cs.id
      WHERE cm.user_id = auth.uid()
      AND cs.status = 'active'
    )
  )
);