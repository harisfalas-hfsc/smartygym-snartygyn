-- Fix invalid categories
UPDATE admin_workouts SET category = 'CARDIO' WHERE category = 'CARDIO ENDURANCE';
UPDATE admin_workouts SET category = 'MOBILITY & STABILITY' WHERE category = 'MOBILITY';

-- Fix TYPE column - should match FORMAT
UPDATE admin_workouts 
SET type = format 
WHERE format IN ('TABATA', 'CIRCUIT', 'AMRAP', 'FOR TIME', 'EMOM', 'REPS & SETS', 'MIX')
  AND (type IS NULL OR type NOT IN ('TABATA', 'CIRCUIT', 'AMRAP', 'FOR TIME', 'EMOM', 'REPS & SETS', 'MIX'));

-- Clear the focus column completely since it's not used
UPDATE admin_workouts SET focus = NULL;

-- Add database constraint for valid categories
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE admin_workouts 
ADD CONSTRAINT valid_category CHECK (
  category IS NULL OR category IN ('STRENGTH', 'CALORIE BURNING', 'METABOLIC', 'CARDIO', 'MOBILITY & STABILITY', 'CHALLENGE')
);

-- Add database constraint for valid formats
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_format;
ALTER TABLE admin_workouts 
ADD CONSTRAINT valid_format CHECK (
  format IS NULL OR format IN ('TABATA', 'CIRCUIT', 'AMRAP', 'FOR TIME', 'EMOM', 'REPS & SETS', 'MIX')
);

-- Add database constraint for valid equipment
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_equipment;
ALTER TABLE admin_workouts 
ADD CONSTRAINT valid_equipment CHECK (
  equipment IS NULL OR equipment IN ('BODYWEIGHT', 'EQUIPMENT')
);