-- Remove legacy columns from workout_of_day_state that are no longer used
-- The 84-day cycle calculation is now date-based in code (wodCycle.ts)

ALTER TABLE public.workout_of_day_state 
DROP COLUMN IF EXISTS day_count,
DROP COLUMN IF EXISTS week_number,
DROP COLUMN IF EXISTS current_category,
DROP COLUMN IF EXISTS used_stars_in_week;