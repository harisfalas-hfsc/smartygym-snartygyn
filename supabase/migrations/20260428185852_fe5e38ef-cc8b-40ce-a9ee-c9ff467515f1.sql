-- Harden paid content read policies for workouts and training programs

CREATE OR REPLACE FUNCTION public.user_has_active_premium_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.user_subscriptions us
      WHERE us.user_id = _user_id
        AND us.status = 'active'::public.subscription_status
        AND us.plan_type IN ('gold'::public.plan_type, 'platinum'::public.plan_type)
    )
    OR EXISTS (
      SELECT 1
      FROM public.corporate_subscriptions cs
      WHERE cs.admin_user_id = _user_id
        AND cs.status = 'active'
    )
    OR EXISTS (
      SELECT 1
      FROM public.corporate_members cm
      JOIN public.corporate_subscriptions cs
        ON cs.id = cm.corporate_subscription_id
      WHERE cm.user_id = _user_id
        AND cs.status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.user_has_purchased_content(
  _user_id uuid,
  _content_type text,
  _content_id text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_purchases up
    WHERE up.user_id = _user_id
      AND up.content_type = _content_type
      AND up.content_id = _content_id
      AND COALESCE(up.content_deleted, false) = false
  );
$$;

ALTER TABLE public.admin_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_training_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view all workouts" ON public.admin_workouts;
DROP POLICY IF EXISTS "Public can view free workouts metadata" ON public.admin_workouts;
DROP POLICY IF EXISTS "Authenticated users can view workouts they can access" ON public.admin_workouts;
DROP POLICY IF EXISTS "Public can view all programs" ON public.admin_training_programs;
DROP POLICY IF EXISTS "Public can view free programs metadata" ON public.admin_training_programs;
DROP POLICY IF EXISTS "Authenticated users can view programs they can access" ON public.admin_training_programs;

CREATE POLICY "Public can view visible free workouts"
ON public.admin_workouts
FOR SELECT
TO public
USING (
  COALESCE(is_visible, true) = true
  AND COALESCE(is_premium, false) = false
);

CREATE POLICY "Signed in users can view accessible workouts"
ON public.admin_workouts
FOR SELECT
TO authenticated
USING (
  COALESCE(is_visible, true) = true
  AND (
    COALESCE(is_premium, false) = false
    OR public.user_has_active_premium_access(auth.uid())
    OR public.user_has_purchased_content(auth.uid(), 'workout', id)
    OR (
      COALESCE(is_standalone_purchase, false) = true
      AND COALESCE(price, 0) > 0
      AND stripe_price_id IS NOT NULL
      AND stripe_product_id IS NOT NULL
    )
  )
);

CREATE POLICY "Admins can view all workouts"
ON public.admin_workouts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Public can view visible free programs"
ON public.admin_training_programs
FOR SELECT
TO public
USING (
  COALESCE(is_visible, true) = true
  AND COALESCE(is_premium, false) = false
);

CREATE POLICY "Signed in users can view accessible programs"
ON public.admin_training_programs
FOR SELECT
TO authenticated
USING (
  COALESCE(is_visible, true) = true
  AND (
    COALESCE(is_premium, false) = false
    OR public.user_has_active_premium_access(auth.uid())
    OR public.user_has_purchased_content(auth.uid(), 'program', id)
    OR (
      COALESCE(is_standalone_purchase, false) = true
      AND COALESCE(price, 0) > 0
      AND stripe_price_id IS NOT NULL
      AND stripe_product_id IS NOT NULL
    )
  )
);

CREATE POLICY "Admins can view all programs"
ON public.admin_training_programs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));