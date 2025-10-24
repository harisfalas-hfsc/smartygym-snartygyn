-- Make video_url nullable in exercises table
ALTER TABLE public.exercises 
ALTER COLUMN video_url DROP NOT NULL;