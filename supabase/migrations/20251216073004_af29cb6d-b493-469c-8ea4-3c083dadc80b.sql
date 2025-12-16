-- Drop foreign key constraint on workout_comments to allow seeded fake comments
-- This matches the testimonials table which has no FK constraint

ALTER TABLE workout_comments DROP CONSTRAINT IF EXISTS workout_comments_user_id_fkey;

-- Insert 7 fake comments with safe fake user_ids
-- 4 Workout comments
INSERT INTO workout_comments (user_id, workout_id, workout_name, workout_type, comment_text)
VALUES 
  ('00000000-0000-0000-0000-000000000012', 'S-004', 'Barbell Domination Protocol', 'STRENGTH', 'This workout pushed me to my limits! The progressive overload structure is exactly what I needed to break through my plateau.'),
  ('00000000-0000-0000-0000-000000000013', 'S-005', 'Zero Gravity Strength Architect', 'STRENGTH', 'Perfect bodyweight workout for when I am traveling. No equipment needed and I still feel completely destroyed after!'),
  ('00000000-0000-0000-0000-000000000014', 'ME-004', 'Kettlebell Chaos Engine', 'METABOLIC', 'Incredible metabolic burn! My heart rate was through the roof the entire time. Definitely adding this to my weekly rotation.'),
  ('00000000-0000-0000-0000-000000000015', 'CB-005', 'Furnace Factory Shred', 'CALORIE BURNING', 'Best calorie burner I have tried. The circuit format keeps you moving non-stop. Highly recommend!');

-- 3 Training Program comments
INSERT INTO workout_comments (user_id, program_id, program_name, program_type, comment_text)
VALUES 
  ('00000000-0000-0000-0000-000000000016', 'M-4', 'Mass Domination Protocol', 'MUSCLE BUILDING', 'Week 6 into this program and seeing serious gains. The volume is challenging but the results speak for themselves!'),
  ('00000000-0000-0000-0000-000000000017', 'W-2', 'Fat Furnace', 'WEIGHT LOSS', 'Lost 8kg in the first month. The combination of workouts and nutrition guidance is perfect for weight loss.'),
  ('00000000-0000-0000-0000-000000000018', 'F-3', 'Athletic Performance Builder', 'FUNCTIONAL FITNESS', 'As a recreational athlete, this program improved my functional strength dramatically. I am faster and more explosive now.');