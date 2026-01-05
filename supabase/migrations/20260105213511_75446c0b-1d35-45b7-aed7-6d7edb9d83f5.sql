
-- Update format constraint to use only uppercase standard values
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_format;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_format CHECK (
  format IN (
    'AMRAP', 
    'CIRCUIT', 
    'EMOM', 
    'FOR TIME', 
    'MIX', 
    'REPS & SETS', 
    'TABATA'
  ) OR format IS NULL
);
