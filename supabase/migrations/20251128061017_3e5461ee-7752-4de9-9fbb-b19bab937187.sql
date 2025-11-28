-- Add is_visible column to admin_workouts (default TRUE so existing content stays visible)
ALTER TABLE admin_workouts ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- Add is_visible column to admin_training_programs (default TRUE so existing content stays visible)
ALTER TABLE admin_training_programs ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;