-- Insert multi-activity test data for November 2025
-- User: harisfalas@gmail.com (19f14d6b-4da2-4ac6-b3dd-bb20f29257b9)

-- November 3, 2025: Workout + Program + Tool
INSERT INTO user_activity_log (user_id, content_type, item_id, item_name, action_type, activity_date, tool_input, created_at)
VALUES
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'cardio-blast-nov3', 'Cardio Blast', 'viewed', '2025-11-03', NULL, '2025-11-03 10:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'weight-loss-ignite-nov3', 'Weight Loss Ignite', 'viewed', '2025-11-03', NULL, '2025-11-03 10:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', '1rm-calculator-nov3', '1RM Calculator', 'calculated', '2025-11-03', '{"exercise": "Squat", "weight": 120, "reps": 6}'::jsonb, '2025-11-03 11:00:00'),
  
-- November 5, 2025: Workout (completed) + Measurement + Tool
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'hiit-inferno-nov5', 'HIIT Inferno', 'completed', '2025-11-05', NULL, '2025-11-05 08:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'weight-log-nov5', 'Weight Measurement', 'calculated', '2025-11-05', '{"weight": 84.2, "unit": "kg"}'::jsonb, '2025-11-05 08:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'bmr-calculator-nov5', 'BMR Calculator', 'calculated', '2025-11-05', '{"age": 28, "gender": "male", "height": 180, "weight": 84.2}'::jsonb, '2025-11-05 09:00:00'),

-- November 8, 2025: Workout + Program + Measurement
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'body-blast-nov8', 'Body Blast Power', 'viewed', '2025-11-08', NULL, '2025-11-08 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'muscle-hypertrophy-nov8', 'Muscle Hypertrophy', 'viewed', '2025-11-08', NULL, '2025-11-08 07:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'bodyfat-log-nov8', 'Body Fat Measurement', 'calculated', '2025-11-08', '{"body_fat": 17.8, "unit": "%"}'::jsonb, '2025-11-08 08:00:00'),

-- November 10, 2025: Workout (completed) + Tool + Measurement
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'metabo-surge-nov10', 'Metabo Surge', 'completed', '2025-11-10', NULL, '2025-11-10 06:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'macro-calculator-nov10', 'Macro Tracking Calculator', 'calculated', '2025-11-10', '{"calories": 2200, "protein": 165, "carbs": 220, "fats": 73}'::jsonb, '2025-11-10 08:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'weight-log-nov10', 'Weight Measurement', 'calculated', '2025-11-10', '{"weight": 83.9, "unit": "kg"}'::jsonb, '2025-11-10 08:30:00'),

-- November 12, 2025: Program + Tool + Measurement
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'cardio-endurance-nov12', 'Cardio Endurance', 'viewed', '2025-11-12', NULL, '2025-11-12 09:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', '1rm-calculator-nov12', '1RM Calculator', 'calculated', '2025-11-12', '{"exercise": "Deadlift", "weight": 140, "reps": 5}'::jsonb, '2025-11-12 10:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'body-measurements-nov12', 'Body Measurements', 'calculated', '2025-11-12', '{"chest": 103, "waist": 84, "hips": 99, "unit": "cm"}'::jsonb, '2025-11-12 11:00:00'),

-- November 15, 2025: Workout (completed) + Program (completed) + Tool
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'power-surge-nov15', 'Power Surge', 'completed', '2025-11-15', NULL, '2025-11-15 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'functional-strength-nov15', 'Functional Strength', 'completed', '2025-11-15', NULL, '2025-11-15 07:45:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'bmr-calculator-nov15', 'BMR Calculator', 'calculated', '2025-11-15', '{"age": 28, "gender": "male", "height": 180, "weight": 83.5}'::jsonb, '2025-11-15 08:30:00'),

-- November 18, 2025: Workout + Measurement + Tool
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'explosive-engine-nov18', 'Explosive Engine', 'viewed', '2025-11-18', NULL, '2025-11-18 06:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'weight-log-nov18', 'Weight Measurement', 'calculated', '2025-11-18', '{"weight": 83.5, "unit": "kg"}'::jsonb, '2025-11-18 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'macro-calculator-nov18', 'Macro Tracking Calculator', 'calculated', '2025-11-18', '{"calories": 2150, "protein": 160, "carbs": 215, "fats": 72}'::jsonb, '2025-11-18 08:00:00'),

-- November 20, 2025: Workout (completed) + Program + Tool
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'iron-core-nov20', 'Iron Core', 'completed', '2025-11-20', NULL, '2025-11-20 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'mobility-stability-nov20', 'Mobility & Stability Flow', 'viewed', '2025-11-20', NULL, '2025-11-20 07:45:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', '1rm-calculator-nov20', '1RM Calculator', 'calculated', '2025-11-20', '{"exercise": "Bench Press", "weight": 100, "reps": 7}'::jsonb, '2025-11-20 08:30:00'),

-- November 24, 2025: Workout (completed) + Measurement + Tool
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'fat-furnace-nov24', 'Fat Furnace', 'completed', '2025-11-24', NULL, '2025-11-24 06:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'bodyfat-log-nov24', 'Body Fat Measurement', 'calculated', '2025-11-24', '{"body_fat": 17.2, "unit": "%"}'::jsonb, '2025-11-24 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'bmr-calculator-nov24', 'BMR Calculator', 'calculated', '2025-11-24', '{"age": 28, "gender": "male", "height": 180, "weight": 83.1}'::jsonb, '2025-11-24 08:00:00'),

-- November 28, 2025: Workout + Program + Measurement + Tool (4 activities)
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'workout', 'sweat-storm-nov28', 'Sweat Storm', 'viewed', '2025-11-28', NULL, '2025-11-28 06:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'program', 'low-back-performance-nov28', 'Low Back Performance', 'viewed', '2025-11-28', NULL, '2025-11-28 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'measurement', 'weight-log-nov28', 'Weight Measurement', 'calculated', '2025-11-28', '{"weight": 83.1, "unit": "kg"}'::jsonb, '2025-11-28 08:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'tool', 'macro-calculator-nov28', 'Macro Tracking Calculator', 'calculated', '2025-11-28', '{"calories": 2100, "protein": 158, "carbs": 210, "fats": 70}'::jsonb, '2025-11-28 09:00:00');

-- Insert workout_interactions for the workouts
INSERT INTO workout_interactions (user_id, workout_id, workout_type, workout_name, is_completed, has_viewed, created_at, updated_at)
VALUES
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-blast-nov3', 'Cardio', 'Cardio Blast', false, true, '2025-11-03 10:00:00', '2025-11-03 10:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'hiit-inferno-nov5', 'HIIT', 'HIIT Inferno', true, true, '2025-11-05 08:00:00', '2025-11-05 08:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'body-blast-nov8', 'Strength', 'Body Blast Power', false, true, '2025-11-08 07:00:00', '2025-11-08 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'metabo-surge-nov10', 'Metabolic', 'Metabo Surge', true, true, '2025-11-10 06:00:00', '2025-11-10 06:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'power-surge-nov15', 'Power', 'Power Surge', true, true, '2025-11-15 07:00:00', '2025-11-15 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'explosive-engine-nov18', 'Power', 'Explosive Engine', false, true, '2025-11-18 06:30:00', '2025-11-18 06:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'iron-core-nov20', 'Strength', 'Iron Core', true, true, '2025-11-20 07:00:00', '2025-11-20 07:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'fat-furnace-nov24', 'Fat Burning', 'Fat Furnace', true, true, '2025-11-24 06:00:00', '2025-11-24 06:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'sweat-storm-nov28', 'Cardio', 'Sweat Storm', false, true, '2025-11-28 06:00:00', '2025-11-28 06:00:00');

-- Insert program_interactions for the programs
INSERT INTO program_interactions (user_id, program_id, program_type, program_name, is_ongoing, is_completed, has_viewed, created_at, updated_at)
VALUES
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'weight-loss-ignite-nov3', 'Weight Loss', 'Weight Loss Ignite', false, false, true, '2025-11-03 10:30:00', '2025-11-03 10:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'muscle-hypertrophy-nov8', 'Muscle Building', 'Muscle Hypertrophy', true, false, true, '2025-11-08 07:30:00', '2025-11-08 07:30:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'cardio-endurance-nov12', 'Cardio', 'Cardio Endurance', false, false, true, '2025-11-12 09:00:00', '2025-11-12 09:00:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'functional-strength-nov15', 'Strength', 'Functional Strength', false, true, true, '2025-11-15 07:45:00', '2025-11-15 07:45:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'mobility-stability-nov20', 'Mobility', 'Mobility & Stability Flow', true, false, true, '2025-11-20 07:45:00', '2025-11-20 07:45:00'),
  ('19f14d6b-4da2-4ac6-b3dd-bb20f29257b9', 'low-back-performance-nov28', 'Recovery', 'Low Back Performance', false, false, true, '2025-11-28 07:00:00', '2025-11-28 07:00:00');