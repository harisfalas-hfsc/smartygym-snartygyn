-- Phase 1: Fix existing micro-workouts to standardized values
UPDATE admin_workouts
SET 
  equipment = 'BODYWEIGHT',
  difficulty = 'All Levels',
  difficulty_stars = NULL,
  duration = '5 min'
WHERE category = 'MICRO-WORKOUTS';

-- Phase 4: Create trigger to enforce micro-workout rules permanently
CREATE OR REPLACE FUNCTION enforce_micro_workout_rules()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category = 'MICRO-WORKOUTS' THEN
    NEW.equipment := 'BODYWEIGHT';
    NEW.difficulty := 'All Levels';
    NEW.difficulty_stars := NULL;
    NEW.duration := '5 min';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS enforce_micro_workout_rules_trigger ON admin_workouts;

CREATE TRIGGER enforce_micro_workout_rules_trigger
BEFORE INSERT OR UPDATE ON admin_workouts
FOR EACH ROW EXECUTE FUNCTION enforce_micro_workout_rules();