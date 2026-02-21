
-- 1. Add wod_mode column to config table
ALTER TABLE wod_auto_generation_config 
ADD COLUMN wod_mode text NOT NULL DEFAULT 'generate';

-- 2. Add wod_source column to admin_workouts
ALTER TABLE admin_workouts 
ADD COLUMN wod_source text DEFAULT NULL;

-- 3. Create cooldown tracking table
CREATE TABLE wod_selection_cooldown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_workout_id text NOT NULL,
  selected_for_date date NOT NULL,
  category text NOT NULL,
  difficulty text,
  equipment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_workout_id, selected_for_date)
);

-- Enable RLS
ALTER TABLE wod_selection_cooldown ENABLE ROW LEVEL SECURITY;

-- Admin read access
CREATE POLICY "Admins can view cooldown" ON wod_selection_cooldown
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role full access
CREATE POLICY "Service role can manage cooldown" ON wod_selection_cooldown
  FOR ALL USING (true) WITH CHECK (true);
