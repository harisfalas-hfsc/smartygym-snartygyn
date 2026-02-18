ALTER TABLE user_measurement_goals
  ADD COLUMN weight_goal_achieved_at timestamptz,
  ADD COLUMN body_fat_goal_achieved_at timestamptz,
  ADD COLUMN muscle_mass_goal_achieved_at timestamptz,
  ADD COLUMN workouts_goal_achieved_at timestamptz,
  ADD COLUMN programs_goal_achieved_at timestamptz;