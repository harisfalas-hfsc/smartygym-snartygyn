-- Drop the existing constraint and recreate with 'incomplete' included
ALTER TABLE public.smarty_checkins 
DROP CONSTRAINT IF EXISTS smarty_checkins_status_check;

ALTER TABLE public.smarty_checkins 
ADD CONSTRAINT smarty_checkins_status_check 
CHECK (status IN ('complete', 'incomplete', 'incomplete_morning_only', 'incomplete_night_only', 'missed'));