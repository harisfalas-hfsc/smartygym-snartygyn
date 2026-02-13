
-- Fix workout_interactions INSERT policy to allow purchased content users
DROP POLICY IF EXISTS "Users can insert workout interactions based on tier" ON workout_interactions;

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

-- Fix program_interactions INSERT policy to allow purchased content users
DROP POLICY IF EXISTS "Users can insert program interactions based on tier" ON program_interactions;

CREATE POLICY "Users can insert program interactions based on tier"
ON program_interactions FOR INSERT TO authenticated
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
    -- Users who purchased this specific program
    OR EXISTS (SELECT 1 FROM user_purchases WHERE user_id = auth.uid() AND content_id = program_interactions.program_id AND content_type = 'program' AND content_deleted = false)
    -- Free users on free content (view-only interactions)
    OR (is_favorite IS NOT TRUE AND is_completed IS NOT TRUE AND rating IS NULL AND is_ongoing IS NOT TRUE)
  )
);
