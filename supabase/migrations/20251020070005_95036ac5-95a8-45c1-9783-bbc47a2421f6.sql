-- Create favorite_exercises table
CREATE TABLE public.favorite_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_name)
);

-- Enable Row Level Security
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for favorite_exercises
CREATE POLICY "Users can view their own favorite exercises"
ON public.favorite_exercises
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite exercises"
ON public.favorite_exercises
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite exercises"
ON public.favorite_exercises
FOR DELETE
USING (auth.uid() = user_id);