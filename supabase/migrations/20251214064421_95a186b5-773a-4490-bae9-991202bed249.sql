-- Add new columns to workout_of_day_state for 7-day cycle support
ALTER TABLE public.workout_of_day_state 
ADD COLUMN IF NOT EXISTS week_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS used_stars_in_week jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS manual_overrides jsonb DEFAULT '{}'::jsonb;

-- Update existing row with initial values
UPDATE public.workout_of_day_state 
SET week_number = 1, 
    used_stars_in_week = '{}'::jsonb, 
    manual_overrides = '{}'::jsonb
WHERE week_number IS NULL;