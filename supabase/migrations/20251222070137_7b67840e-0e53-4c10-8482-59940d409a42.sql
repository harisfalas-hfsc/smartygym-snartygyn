-- Add VARIOUS to valid_equipment constraint for admin_workouts (for Recovery workouts)
ALTER TABLE admin_workouts DROP CONSTRAINT valid_equipment;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_equipment CHECK (
  equipment IS NULL OR equipment = ANY (ARRAY['BODYWEIGHT', 'EQUIPMENT', 'VARIOUS'])
);