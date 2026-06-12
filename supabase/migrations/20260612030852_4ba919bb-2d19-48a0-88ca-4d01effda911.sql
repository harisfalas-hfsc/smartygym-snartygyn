CREATE TABLE public.workout_fix_staging (
  id text PRIMARY KEY,
  main_workout text,
  finisher text
);
GRANT ALL ON public.workout_fix_staging TO service_role;