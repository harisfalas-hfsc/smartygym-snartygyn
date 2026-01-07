-- Fix historical admin-granted subscriptions missing expiration dates
UPDATE user_subscriptions 
SET current_period_end = 
  CASE 
    WHEN plan_type = 'gold' THEN now() + interval '1 month'
    WHEN plan_type = 'platinum' THEN now() + interval '1 year'
  END
WHERE subscription_source = 'admin_grant' 
AND current_period_end IS NULL 
AND status = 'active';

-- Remove duplicate RLS policies on user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;