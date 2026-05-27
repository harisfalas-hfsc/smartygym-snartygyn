
-- Repair 2026-05-27: promote the matching Beginner Pilates EQUIPMENT sibling
-- so the day has both WOD slots (BODYWEIGHT + EQUIPMENT).
UPDATE public.admin_workouts
SET
  is_workout_of_day = true,
  generated_for_date = '2026-05-27',
  wod_source = 'library',
  is_free = false,
  is_premium = true,
  is_standalone_purchase = true,
  price = 3.99,
  updated_at = now()
WHERE id = 'WOD-PIL-E-1772577006728'
  AND stripe_product_id IS NOT NULL
  AND stripe_price_id IS NOT NULL
  AND image_url ILIKE 'https://%';

INSERT INTO public.wod_selection_cooldown
  (source_workout_id, selected_for_date, category, difficulty, equipment)
SELECT 'WOD-PIL-E-1772577006728', '2026-05-27', 'PILATES', 'Beginner', 'EQUIPMENT'
WHERE NOT EXISTS (
  SELECT 1 FROM public.wod_selection_cooldown
  WHERE source_workout_id = 'WOD-PIL-E-1772577006728'
    AND selected_for_date = '2026-05-27'
);
