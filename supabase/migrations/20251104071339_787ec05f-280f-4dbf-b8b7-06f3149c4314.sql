-- Create comments table for workouts and training programs
CREATE TABLE public.workout_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT,
  workout_name TEXT,
  workout_type TEXT,
  program_id TEXT,
  program_name TEXT,
  program_type TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_workout_or_program CHECK (
    (workout_id IS NOT NULL AND program_id IS NULL) OR 
    (workout_id IS NULL AND program_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.workout_comments
FOR SELECT
USING (true);

-- Only premium users can insert comments
CREATE POLICY "Premium users can insert comments"
ON public.workout_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = auth.uid()
    AND plan_type IN ('gold', 'platinum')
    AND status = 'active'
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.workout_comments
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.workout_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_workout_comments_updated_at
BEFORE UPDATE ON public.workout_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();