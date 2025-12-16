-- Add new filtering columns to exercise_library_videos table
ALTER TABLE public.exercise_library_videos 
ADD COLUMN IF NOT EXISTS muscle_group text,
ADD COLUMN IF NOT EXISTS target_muscle text,
ADD COLUMN IF NOT EXISTS workout_category text,
ADD COLUMN IF NOT EXISTS program_category text;

-- Add comments for documentation
COMMENT ON COLUMN public.exercise_library_videos.muscle_group IS 'Body region: Upper Body, Lower Body, or Core';
COMMENT ON COLUMN public.exercise_library_videos.target_muscle IS 'Specific muscle targeted by the exercise';
COMMENT ON COLUMN public.exercise_library_videos.workout_category IS 'Associated workout category (Strength, Cardio, etc.)';
COMMENT ON COLUMN public.exercise_library_videos.program_category IS 'Associated training program category';