-- Fix the 7 workouts with mismatched difficulty/stars
UPDATE admin_workouts 
SET difficulty = CASE 
  WHEN difficulty_stars IN (1, 2) THEN 'Beginner'
  WHEN difficulty_stars IN (3, 4) THEN 'Intermediate'
  WHEN difficulty_stars IN (5, 6) THEN 'Advanced'
  ELSE 'Beginner'
END
WHERE 
  (difficulty = 'Beginner' AND difficulty_stars NOT IN (1, 2))
  OR (difficulty = 'Intermediate' AND difficulty_stars NOT IN (3, 4))
  OR (difficulty = 'Advanced' AND difficulty_stars NOT IN (5, 6));

-- Also fix any training programs with mismatched difficulty/stars
UPDATE admin_training_programs 
SET difficulty = CASE 
  WHEN difficulty_stars IN (1, 2) THEN 'Beginner'
  WHEN difficulty_stars IN (3, 4) THEN 'Intermediate'
  WHEN difficulty_stars IN (5, 6) THEN 'Advanced'
  ELSE 'Beginner'
END
WHERE 
  difficulty_stars IS NOT NULL
  AND (
    (difficulty = 'Beginner' AND difficulty_stars NOT IN (1, 2))
    OR (difficulty = 'Intermediate' AND difficulty_stars NOT IN (3, 4))
    OR (difficulty = 'Advanced' AND difficulty_stars NOT IN (5, 6))
  );

-- Create function to auto-sync difficulty from difficulty_stars
CREATE OR REPLACE FUNCTION public.sync_difficulty_from_stars()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.difficulty_stars IS NOT NULL THEN
    NEW.difficulty := CASE 
      WHEN NEW.difficulty_stars IN (1, 2) THEN 'Beginner'
      WHEN NEW.difficulty_stars IN (3, 4) THEN 'Intermediate'
      WHEN NEW.difficulty_stars IN (5, 6) THEN 'Advanced'
      ELSE 'Beginner'
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply trigger to admin_workouts
DROP TRIGGER IF EXISTS sync_workout_difficulty ON admin_workouts;
CREATE TRIGGER sync_workout_difficulty
  BEFORE INSERT OR UPDATE ON admin_workouts
  FOR EACH ROW
  EXECUTE FUNCTION sync_difficulty_from_stars();

-- Apply trigger to admin_training_programs
DROP TRIGGER IF EXISTS sync_program_difficulty ON admin_training_programs;
CREATE TRIGGER sync_program_difficulty
  BEFORE INSERT OR UPDATE ON admin_training_programs
  FOR EACH ROW
  EXECUTE FUNCTION sync_difficulty_from_stars();