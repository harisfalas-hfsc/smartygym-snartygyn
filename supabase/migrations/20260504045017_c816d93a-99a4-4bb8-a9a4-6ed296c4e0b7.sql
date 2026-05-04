-- Archive duplicate cardio premium workouts (keep newest pair)
UPDATE public.admin_workouts SET is_visible = false
WHERE id IN ('PREM-adv-cardio-B-1777869501543', 'PREM-adv-cardio-E-1777869516248');

-- Wrap all premium workouts main_workout in workout-content div
UPDATE public.admin_workouts
SET main_workout = '<div class="workout-content">' || main_workout || '</div>'
WHERE id LIKE 'PREM-%' AND main_workout NOT LIKE '%workout-content%';

-- Rename workouts with AI-debug suffixes to clean human names
UPDATE public.admin_workouts SET name = 'Helix Integration' WHERE id = 'PREM-adv-strength-B-1777869135777';
UPDATE public.admin_workouts SET name = 'Iron Current'       WHERE id = 'PREM-adv-strength-E-1777869151825';
UPDATE public.admin_workouts SET name = 'Compass Blitz'      WHERE id = 'PREM-adv-calorie-burning-B-1777869234734';
UPDATE public.admin_workouts SET name = 'Stable Compass'     WHERE id = 'PREM-adv-mobility-stability-B-1777870076090';
UPDATE public.admin_workouts SET name = 'Anchor Meridian'    WHERE id = 'PREM-adv-mobility-stability-E-1777870092016';