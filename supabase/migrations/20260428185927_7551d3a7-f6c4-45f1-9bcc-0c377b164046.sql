-- Finalize full-content RLS hardening and add safe metadata views

DROP POLICY IF EXISTS "Signed in users can view accessible workouts" ON public.admin_workouts;
DROP POLICY IF EXISTS "Signed in users can view accessible programs" ON public.admin_training_programs;

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
  )
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
  )
);

DROP VIEW IF EXISTS public.public_workout_metadata;
CREATE VIEW public.public_workout_metadata AS
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
CREATE VIEW public.public_program_metadata AS
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