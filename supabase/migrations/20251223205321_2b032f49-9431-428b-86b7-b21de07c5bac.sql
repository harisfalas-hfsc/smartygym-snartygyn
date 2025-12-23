-- Create table for tracking unmatched exercises from AI-generated content
CREATE TABLE public.mismatched_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'wod', 'workout', 'program'
  source_id TEXT,
  source_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_exercise_id TEXT,
  UNIQUE(exercise_name) -- prevent duplicate entries for same exercise name
);

-- Enable RLS
ALTER TABLE public.mismatched_exercises ENABLE ROW LEVEL SECURITY;

-- Only admins can view mismatched exercises
CREATE POLICY "Admins can view mismatched exercises"
ON public.mismatched_exercises
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert mismatched exercises
CREATE POLICY "Admins can insert mismatched exercises"
ON public.mismatched_exercises
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update mismatched exercises
CREATE POLICY "Admins can update mismatched exercises"
ON public.mismatched_exercises
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete mismatched exercises
CREATE POLICY "Admins can delete mismatched exercises"
ON public.mismatched_exercises
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));