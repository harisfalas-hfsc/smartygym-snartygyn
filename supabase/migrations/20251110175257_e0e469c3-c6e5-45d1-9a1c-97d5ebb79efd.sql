-- Add missing columns to admin_training_programs table
ALTER TABLE admin_training_programs
ADD COLUMN IF NOT EXISTS serial_number INTEGER,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS weeks INTEGER,
ADD COLUMN IF NOT EXISTS days_per_week INTEGER;