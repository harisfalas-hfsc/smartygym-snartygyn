-- Drop existing category constraint and add new one with MICRO-WORKOUTS
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_category;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_category CHECK (
  category IN (
    'STRENGTH', 
    'CARDIO', 
    'CALORIE BURNING', 
    'METABOLIC', 
    'MOBILITY & STABILITY', 
    'RECOVERY', 
    'PILATES', 
    'CHALLENGE',
    'MICRO-WORKOUTS'
  )
);