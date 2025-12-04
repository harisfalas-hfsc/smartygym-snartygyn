-- Add format_usage column to track format rotation per category
ALTER TABLE workout_of_day_state 
ADD COLUMN IF NOT EXISTS format_usage JSONB DEFAULT '{}'::jsonb;