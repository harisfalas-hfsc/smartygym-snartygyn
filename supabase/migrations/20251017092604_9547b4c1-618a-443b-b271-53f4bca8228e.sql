-- Create calculator history tables

-- 1RM Calculator History
CREATE TABLE public.onerm_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_lifted DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  one_rm_result DECIMAL(6,2) NOT NULL,
  exercise_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- BMR Calculator History
CREATE TABLE public.bmr_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  height DECIMAL(6,2) NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  bmr_result INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calorie Calculator History
CREATE TABLE public.calorie_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL,
  height DECIMAL(6,2) NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  activity_level TEXT NOT NULL,
  goal TEXT NOT NULL CHECK (goal IN ('lose', 'maintain', 'gain')),
  maintenance_calories INTEGER NOT NULL,
  target_calories INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onerm_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bmr_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 1RM History
CREATE POLICY "Users can view their own 1RM history"
  ON public.onerm_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 1RM history"
  ON public.onerm_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 1RM history"
  ON public.onerm_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for BMR History
CREATE POLICY "Users can view their own BMR history"
  ON public.bmr_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own BMR history"
  ON public.bmr_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own BMR history"
  ON public.bmr_history FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Calorie History
CREATE POLICY "Users can view their own calorie history"
  ON public.calorie_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calorie history"
  ON public.calorie_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calorie history"
  ON public.calorie_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_onerm_history_user_id ON public.onerm_history(user_id);
CREATE INDEX idx_onerm_history_created_at ON public.onerm_history(created_at DESC);
CREATE INDEX idx_bmr_history_user_id ON public.bmr_history(user_id);
CREATE INDEX idx_bmr_history_created_at ON public.bmr_history(created_at DESC);
CREATE INDEX idx_calorie_history_user_id ON public.calorie_history(user_id);
CREATE INDEX idx_calorie_history_created_at ON public.calorie_history(created_at DESC);