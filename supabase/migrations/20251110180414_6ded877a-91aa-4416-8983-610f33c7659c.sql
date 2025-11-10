-- Add difficulty_stars column to admin_training_programs
ALTER TABLE admin_training_programs 
ADD COLUMN IF NOT EXISTS difficulty_stars INTEGER DEFAULT 1;