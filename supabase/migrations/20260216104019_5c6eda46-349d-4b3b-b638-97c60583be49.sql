
-- Add frame columns for two-frame animation support
ALTER TABLE public.exercises
ADD COLUMN frame_start_url text,
ADD COLUMN frame_end_url text;
