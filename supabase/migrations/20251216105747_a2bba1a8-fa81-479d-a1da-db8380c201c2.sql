-- Add workout_phase column to exercise_library_videos table
ALTER TABLE public.exercise_library_videos 
ADD COLUMN workout_phase text;