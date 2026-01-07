-- Fix the overly permissive policy - remove the OR TRUE since has_premium_subscription now includes admin check
-- But actually, check-ins should be available to ALL users, so let's just simplify it

DROP POLICY IF EXISTS "Users can insert their own checkins" ON smarty_checkins;
CREATE POLICY "Users can insert their own checkins" ON smarty_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);