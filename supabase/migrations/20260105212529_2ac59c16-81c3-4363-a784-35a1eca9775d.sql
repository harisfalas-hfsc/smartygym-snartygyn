-- Drop existing format constraint and add new one with micro-workout formats
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_format;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_format CHECK (
  format IN (
    'AMRAP', 
    'CIRCUIT', 
    'EMOM', 
    'FOR TIME', 
    'MIX', 
    'REPS & SETS', 
    'TABATA',
    'Interval',
    'Challenge',
    'Circuit'
  ) OR format IS NULL
);