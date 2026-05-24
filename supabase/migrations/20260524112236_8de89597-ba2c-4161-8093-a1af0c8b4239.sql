DROP FUNCTION IF EXISTS public.get_visible_workout_metadata(text);

CREATE OR REPLACE FUNCTION public.get_visible_workout_metadata(_workout_id text DEFAULT NULL::text)
RETURNS TABLE(
  id text,
  name text,
  type text,
  category text,
  description text,
  duration text,
  equipment text,
  difficulty text,
  difficulty_stars integer,
  focus text,
  format text,
  image_url text,
  is_premium boolean,
  tier_required text,
  is_standalone_purchase boolean,
  price numeric,
  stripe_product_id text,
  stripe_price_id text,
  is_workout_of_day boolean,
  generated_for_date date,
  is_free boolean,
  is_visible boolean,
  serial_number integer,
  created_at timestamptz,
  updated_at timestamptz,
  wod_source text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    aw.id,
    aw.name,
    aw.type,
    aw.category,
    aw.description,
    aw.duration,
    aw.equipment,
    aw.difficulty,
    aw.difficulty_stars,
    aw.focus,
    aw.format,
    aw.image_url,
    aw.is_premium,
    aw.tier_required,
    aw.is_standalone_purchase,
    aw.price,
    aw.stripe_product_id,
    aw.stripe_price_id,
    aw.is_workout_of_day,
    aw.generated_for_date,
    aw.is_free,
    aw.is_visible,
    aw.serial_number,
    aw.created_at,
    aw.updated_at,
    aw.wod_source
  FROM public.admin_workouts aw
  WHERE COALESCE(aw.is_visible, true) = true
    AND (_workout_id IS NULL OR aw.id = _workout_id);
$function$;

GRANT EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) TO service_role;