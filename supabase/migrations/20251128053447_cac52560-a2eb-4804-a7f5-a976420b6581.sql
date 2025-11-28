-- Add is_ai_generated column to admin_workouts
ALTER TABLE admin_workouts 
ADD COLUMN is_ai_generated boolean DEFAULT false;

-- Add is_ai_generated column to admin_training_programs
ALTER TABLE admin_training_programs 
ADD COLUMN is_ai_generated boolean DEFAULT false;

-- Add is_ai_generated column to blog_articles
ALTER TABLE blog_articles 
ADD COLUMN is_ai_generated boolean DEFAULT false;

-- Mark existing AI-generated workouts (the ones I created)
UPDATE admin_workouts 
SET is_ai_generated = true 
WHERE id IN (
  'S-001', 'S-002', 'S-003',
  'CB-003', 'CB-004',
  'ME-001', 'ME-002', 'ME-003',
  'C-001', 'C-002', 'C-003',
  'M-001', 'M-002', 'M-003',
  'CH-001', 'CH-002', 'CH-003'
);