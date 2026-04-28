-- Fix metadata views and add safe metadata access functions

DROP VIEW IF EXISTS public.public_workout_metadata;
CREATE VIEW public.public_workout_metadata
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  type,
  category,
  description,
  duration,
  equipment,
  difficulty,
  difficulty_stars,
  focus,
  format,
  image_url,
  is_premium,
  tier_required,
  is_standalone_purchase,
  price,
  stripe_product_id,
  stripe_price_id,
  is_workout_of_day,
  generated_for_date,
  is_free,
  is_visible,
  created_at,
  updated_at,
  serial_number,
  NULL::text AS warm_up,
  NULL::text AS activation,
  NULL::text AS main_workout,
  NULL::text AS finisher,
  NULL::text AS cool_down,
  NULL::text AS instructions,
  NULL::text AS tips,
  NULL::text AS notes
FROM public.admin_workouts
WHERE COALESCE(is_visible, true) = true;

DROP VIEW IF EXISTS public.public_program_metadata;
CREATE VIEW public.public_program_metadata
WITH (security_invoker = on) AS
SELECT
  id,
  name,
  category,
  duration,
  description,
  image_url,
  is_premium,
  tier_required,
  difficulty,
  equipment,
  weeks,
  days_per_week,
  difficulty_stars,
  is_standalone_purchase,
  price,
  stripe_product_id,
  stripe_price_id,
  is_free,
  is_visible,
  created_at,
  updated_at,
  serial_number,
  NULL::text AS overview,
  NULL::text AS target_audience,
  NULL::text AS program_structure,
  NULL::text AS weekly_schedule,
  NULL::text AS progression_plan,
  NULL::text AS nutrition_tips,
  NULL::text AS expected_results
FROM public.admin_training_programs
WHERE COALESCE(is_visible, true) = true;

GRANT SELECT ON public.public_workout_metadata TO anon, authenticated;
GRANT SELECT ON public.public_program_metadata TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_visible_workout_metadata(_workout_id text DEFAULT NULL)
RETURNS TABLE (
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
  serial_number integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    aw.serial_number
  FROM public.admin_workouts aw
  WHERE COALESCE(aw.is_visible, true) = true
    AND (_workout_id IS NULL OR aw.id = _workout_id);
$$;

CREATE OR REPLACE FUNCTION public.get_visible_program_metadata(_program_id text DEFAULT NULL)
RETURNS TABLE (
  id text,
  name text,
  category text,
  duration text,
  description text,
  image_url text,
  is_premium boolean,
  tier_required text,
  difficulty text,
  equipment text,
  weeks integer,
  days_per_week integer,
  difficulty_stars integer,
  is_standalone_purchase boolean,
  price numeric,
  stripe_product_id text,
  stripe_price_id text,
  is_free boolean,
  is_visible boolean,
  serial_number integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ap.id,
    ap.name,
    ap.category,
    ap.duration,
    ap.description,
    ap.image_url,
    ap.is_premium,
    ap.tier_required,
    ap.difficulty,
    ap.equipment,
    ap.weeks,
    ap.days_per_week,
    ap.difficulty_stars,
    ap.is_standalone_purchase,
    ap.price,
    ap.stripe_product_id,
    ap.stripe_price_id,
    ap.is_free,
    ap.is_visible,
    ap.serial_number
  FROM public.admin_training_programs ap
  WHERE COALESCE(ap.is_visible, true) = true
    AND (_program_id IS NULL OR ap.id = _program_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_visible_workout_metadata(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_visible_program_metadata(text) TO anon, authenticated;