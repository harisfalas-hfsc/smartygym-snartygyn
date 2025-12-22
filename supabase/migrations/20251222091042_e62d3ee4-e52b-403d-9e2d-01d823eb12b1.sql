-- Add is_free column to admin_workouts
ALTER TABLE admin_workouts ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Add is_free column to admin_training_programs
ALTER TABLE admin_training_programs ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Set is_free = true for workouts with NULL price and not premium
UPDATE admin_workouts SET is_free = true WHERE price IS NULL AND is_premium = false;

-- Set is_free = true for programs with NULL price and not premium
UPDATE admin_training_programs SET is_free = true WHERE price IS NULL AND is_premium = false;