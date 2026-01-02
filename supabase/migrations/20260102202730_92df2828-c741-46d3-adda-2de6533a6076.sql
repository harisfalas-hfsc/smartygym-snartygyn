-- Create user_fitness_goals table
CREATE TABLE public.user_fitness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_goal TEXT NOT NULL DEFAULT 'general_fitness' CHECK (primary_goal IN ('fat_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness', 'recovery')),
  secondary_goal TEXT CHECK (secondary_goal IS NULL OR secondary_goal IN ('fat_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_fitness', 'recovery')),
  time_availability_default INTEGER DEFAULT 30 CHECK (time_availability_default IN (15, 30, 45, 60, 90)),
  equipment_available TEXT DEFAULT 'various' CHECK (equipment_available IN ('bodyweight', 'equipment', 'various')),
  experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create smartly_suggest_interactions table
CREATE TABLE public.smartly_suggest_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_content_type TEXT NOT NULL CHECK (suggested_content_type IN ('workout', 'program')),
  suggested_content_id TEXT NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  questions_asked JSONB DEFAULT '[]'::jsonb,
  user_responses JSONB DEFAULT '{}'::jsonb,
  action_taken TEXT CHECK (action_taken IN ('accepted', 'alternative_1', 'alternative_2', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.user_fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartly_suggest_interactions ENABLE ROW LEVEL SECURITY;

-- Create function to check if user has premium subscription
CREATE OR REPLACE FUNCTION public.has_premium_subscription(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = check_user_id
      AND status = 'active'
      AND plan_type IN ('gold', 'platinum')
  )
$$;

-- RLS policies for user_fitness_goals
CREATE POLICY "Users can view their own goals"
  ON public.user_fitness_goals
  FOR SELECT
  USING (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

CREATE POLICY "Users can insert their own goals"
  ON public.user_fitness_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

CREATE POLICY "Users can update their own goals"
  ON public.user_fitness_goals
  FOR UPDATE
  USING (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

CREATE POLICY "Users can delete their own goals"
  ON public.user_fitness_goals
  FOR DELETE
  USING (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

-- RLS policies for smartly_suggest_interactions
CREATE POLICY "Users can view their own interactions"
  ON public.smartly_suggest_interactions
  FOR SELECT
  USING (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

CREATE POLICY "Users can insert their own interactions"
  ON public.smartly_suggest_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND has_premium_subscription(auth.uid()));

-- Create updated_at trigger for user_fitness_goals
CREATE TRIGGER update_user_fitness_goals_updated_at
  BEFORE UPDATE ON public.user_fitness_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_fitness_goals_user_id ON public.user_fitness_goals(user_id);
CREATE INDEX idx_smartly_suggest_interactions_user_id ON public.smartly_suggest_interactions(user_id);
CREATE INDEX idx_smartly_suggest_interactions_created_at ON public.smartly_suggest_interactions(created_at DESC);