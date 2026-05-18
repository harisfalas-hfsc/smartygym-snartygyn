DO $$
DECLARE
  hidden_ids text[] := ARRAY[
    'WOD-CH-E-1776810602941',
    'WOD-CA-B-1778481004025',
    'PREM-adv-cardio-B-1777869501543',
    'PREM-adv-cardio-E-1777869516248',
    'S-013'
  ];
BEGIN
  DELETE FROM public.workout_interactions WHERE workout_id = ANY(hidden_ids);
  DELETE FROM public.user_purchases WHERE content_type = 'workout' AND content_id = ANY(hidden_ids);
  DELETE FROM public.pending_content_notifications WHERE content_type = 'workout' AND content_id = ANY(hidden_ids);
  DELETE FROM public.admin_workouts WHERE id = ANY(hidden_ids);
END $$;