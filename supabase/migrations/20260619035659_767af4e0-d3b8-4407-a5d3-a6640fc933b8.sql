CREATE OR REPLACE FUNCTION public.has_premium_subscription(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = check_user_id
      AND status = 'active'
      AND plan_type IN ('lifetime', 'legacy_premium', 'premium')
  )
$function$;

CREATE OR REPLACE FUNCTION public.user_has_active_premium_access(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.user_subscriptions us
      WHERE us.user_id = _user_id
        AND us.status = 'active'::public.subscription_status
        AND us.plan_type IN ('lifetime'::public.plan_type, 'legacy_premium'::public.plan_type, 'premium'::public.plan_type)
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
$function$;