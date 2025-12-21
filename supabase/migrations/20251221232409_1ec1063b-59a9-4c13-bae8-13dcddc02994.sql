-- Add PILATES to valid categories for admin_workouts
ALTER TABLE admin_workouts DROP CONSTRAINT valid_category;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_category 
CHECK (category IS NULL OR category = ANY (ARRAY['STRENGTH', 'CALORIE BURNING', 'METABOLIC', 'CARDIO', 'MOBILITY & STABILITY', 'CHALLENGE', 'PILATES']));