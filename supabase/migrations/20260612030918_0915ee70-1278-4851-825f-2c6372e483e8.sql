UPDATE public.admin_workouts w
SET main_workout = COALESCE(NULLIF(s.main_workout,''), w.main_workout),
    finisher = COALESCE(NULLIF(s.finisher,''), w.finisher),
    updated_at = now()
FROM public.workout_fix_staging s
WHERE w.id = s.id;
DROP TABLE public.workout_fix_staging;