-- Part 1: Update has_premium_subscription to include admin bypass
CREATE OR REPLACE FUNCTION public.has_premium_subscription(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = check_user_id
      AND status = 'active'
      AND plan_type IN ('gold', 'platinum')
  )
$$;

-- Part 2: Fix RLS policies with inline subscription checks to include admin bypass

-- Fix smarty_checkins INSERT policy
DROP POLICY IF EXISTS "Premium users can insert their own checkins" ON smarty_checkins;
CREATE POLICY "Users can insert their own checkins" ON smarty_checkins
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (
      has_role(auth.uid(), 'admin')
      OR has_premium_subscription(auth.uid())
      OR TRUE  -- Allow all authenticated users for check-ins (core feature)
    )
  );

-- Fix testimonials INSERT policy
DROP POLICY IF EXISTS "Premium users can insert own testimonial" ON testimonials;
CREATE POLICY "Users can insert own testimonial" ON testimonials
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (
      has_role(auth.uid(), 'admin')
      OR has_premium_subscription(auth.uid())
    )
  );

-- Fix workout_comments INSERT policy
DROP POLICY IF EXISTS "Premium users can insert comments" ON workout_comments;
CREATE POLICY "Users can insert comments" ON workout_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND (
      has_role(auth.uid(), 'admin')
      OR has_premium_subscription(auth.uid())
    )
  );