-- Drop existing equipment constraint and add new one with micro-workout equipment
ALTER TABLE admin_workouts DROP CONSTRAINT IF EXISTS valid_equipment;

ALTER TABLE admin_workouts ADD CONSTRAINT valid_equipment CHECK (
  equipment IN (
    'BODYWEIGHT', 
    'EQUIPMENT', 
    'VARIOUS',
    'Chair, Desk',
    'Stairs',
    'Sofa',
    'Wall'
  ) OR equipment IS NULL
);