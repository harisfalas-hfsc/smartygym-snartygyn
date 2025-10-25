-- Drop favorite_exercises table first (has dependency on exercises)
DROP TABLE IF EXISTS public.favorite_exercises CASCADE;

-- Drop exercises table
DROP TABLE IF EXISTS public.exercises CASCADE;