-- Add is_workout_of_day column to admin_workouts table
ALTER TABLE admin_workouts ADD COLUMN IF NOT EXISTS is_workout_of_day BOOLEAN DEFAULT false;

-- Create index for faster WOD queries
CREATE INDEX IF NOT EXISTS idx_admin_workouts_is_workout_of_day ON admin_workouts(is_workout_of_day) WHERE is_workout_of_day = true;

-- Create WOD state tracking table
CREATE TABLE IF NOT EXISTS workout_of_day_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_count INTEGER NOT NULL DEFAULT 0,
  current_category TEXT NOT NULL DEFAULT 'STRENGTH',
  last_equipment TEXT,
  last_difficulty TEXT,
  equipment_bodyweight_count INTEGER DEFAULT 0,
  equipment_with_count INTEGER DEFAULT 0,
  difficulty_beginner_count INTEGER DEFAULT 0,
  difficulty_intermediate_count INTEGER DEFAULT 0,
  difficulty_advanced_count INTEGER DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on the state table
ALTER TABLE workout_of_day_state ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage this table (edge functions)
CREATE POLICY "Only service role can manage WOD state" 
ON workout_of_day_state 
FOR ALL 
USING (false) 
WITH CHECK (false);

-- Insert initial state row
INSERT INTO workout_of_day_state (day_count, current_category) 
VALUES (0, 'STRENGTH')
ON CONFLICT DO NOTHING;