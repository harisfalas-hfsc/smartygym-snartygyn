-- 1) Drop old unique constraint on (user_id, workout_id, workout_type) if it exists
ALTER TABLE public.workout_interactions
DROP CONSTRAINT IF EXISTS workout_interactions_user_id_workout_id_workout_type_key;

-- 2) Create new unique constraint on (user_id, workout_id)
ALTER TABLE public.workout_interactions
ADD CONSTRAINT workout_interactions_user_id_workout_id_key
UNIQUE (user_id, workout_id);