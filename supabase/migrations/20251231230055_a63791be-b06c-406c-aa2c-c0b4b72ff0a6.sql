-- Add FLOW format to valid_format constraint for Recovery workouts
-- Add VARIOUS to be explicitly supported for Recovery equipment (already in constraint)
-- Drop and recreate valid_format constraint to include FLOW

ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_format;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_format 
  CHECK ((format IS NULL) OR (format = ANY (ARRAY['TABATA'::text, 'CIRCUIT'::text, 'AMRAP'::text, 'FOR TIME'::text, 'EMOM'::text, 'REPS & SETS'::text, 'MIX'::text, 'FLOW'::text])));