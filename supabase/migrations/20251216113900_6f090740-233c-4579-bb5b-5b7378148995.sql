-- Add is_promotional column to exercise_library_videos table
ALTER TABLE public.exercise_library_videos 
ADD COLUMN is_promotional BOOLEAN DEFAULT false;