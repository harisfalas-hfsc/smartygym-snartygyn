-- Add missing columns for the ExerciseDB JSON data
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS difficulty text;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS category text;