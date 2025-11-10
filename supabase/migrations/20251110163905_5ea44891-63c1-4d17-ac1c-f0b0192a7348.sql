-- Add new columns to admin_workouts table
ALTER TABLE admin_workouts 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS serial_number integer,
ADD COLUMN IF NOT EXISTS format text,
ADD COLUMN IF NOT EXISTS activation text,
ADD COLUMN IF NOT EXISTS finisher text,
ADD COLUMN IF NOT EXISTS instructions text,
ADD COLUMN IF NOT EXISTS tips text,
ADD COLUMN IF NOT EXISTS difficulty_stars integer;

-- Create index on serial_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_workouts_serial_number ON admin_workouts(serial_number);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_admin_workouts_category ON admin_workouts(category);