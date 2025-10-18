-- Create table for tracking user interactions with workouts
CREATE TABLE IF NOT EXISTS public.workout_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  workout_name TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  has_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, workout_id, workout_type)
);

-- Create table for tracking user interactions with training programs
CREATE TABLE IF NOT EXISTS public.program_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  program_type TEXT NOT NULL,
  program_name TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  has_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, program_id, program_type)
);

-- Enable RLS
ALTER TABLE public.workout_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_interactions
CREATE POLICY "Users can view their own workout interactions"
  ON public.workout_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout interactions"
  ON public.workout_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout interactions"
  ON public.workout_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout interactions"
  ON public.workout_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for program_interactions
CREATE POLICY "Users can view their own program interactions"
  ON public.program_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program interactions"
  ON public.program_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program interactions"
  ON public.program_interactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own program interactions"
  ON public.program_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on workout_interactions
CREATE TRIGGER update_workout_interactions_updated_at
  BEFORE UPDATE ON public.workout_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for updated_at on program_interactions
CREATE TRIGGER update_program_interactions_updated_at
  BEFORE UPDATE ON public.program_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();