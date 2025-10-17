-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create saved_workouts table
CREATE TABLE public.saved_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  comment TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_workouts
ALTER TABLE public.saved_workouts ENABLE ROW LEVEL SECURITY;

-- Saved workouts policies
CREATE POLICY "Users can view their own workouts"
  ON public.saved_workouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workouts"
  ON public.saved_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.saved_workouts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts"
  ON public.saved_workouts FOR DELETE
  USING (auth.uid() = user_id);

-- Create saved_training_programs table
CREATE TABLE public.saved_training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  comment TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_training_programs
ALTER TABLE public.saved_training_programs ENABLE ROW LEVEL SECURITY;

-- Saved training programs policies
CREATE POLICY "Users can view their own training programs"
  ON public.saved_training_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training programs"
  ON public.saved_training_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training programs"
  ON public.saved_training_programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training programs"
  ON public.saved_training_programs FOR DELETE
  USING (auth.uid() = user_id);

-- Create saved_diet_plans table
CREATE TABLE public.saved_diet_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status TEXT CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
  comment TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_diet_plans
ALTER TABLE public.saved_diet_plans ENABLE ROW LEVEL SECURITY;

-- Saved diet plans policies
CREATE POLICY "Users can view their own diet plans"
  ON public.saved_diet_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diet plans"
  ON public.saved_diet_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diet plans"
  ON public.saved_diet_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diet plans"
  ON public.saved_diet_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create progress_logs table
CREATE TABLE public.progress_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('workout', 'training_program', 'diet_plan')),
  plan_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  weight DECIMAL(5,2),
  photos_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on progress_logs
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- Progress logs policies
CREATE POLICY "Users can view their own progress logs"
  ON public.progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress logs"
  ON public.progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress logs"
  ON public.progress_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress logs"
  ON public.progress_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_saved_workouts
  BEFORE UPDATE ON public.saved_workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_saved_training_programs
  BEFORE UPDATE ON public.saved_training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_saved_diet_plans
  BEFORE UPDATE ON public.saved_diet_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();