-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create workouts table for managing workout content
CREATE TABLE public.admin_workouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    equipment TEXT,
    difficulty TEXT,
    focus TEXT,
    warm_up TEXT,
    main_workout TEXT,
    cool_down TEXT,
    notes TEXT,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    tier_required TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on workouts
ALTER TABLE public.admin_workouts ENABLE ROW LEVEL SECURITY;

-- Workouts are visible to everyone but only admins can modify
CREATE POLICY "Anyone can view workouts"
ON public.admin_workouts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert workouts"
ON public.admin_workouts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update workouts"
ON public.admin_workouts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete workouts"
ON public.admin_workouts
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create training programs table
CREATE TABLE public.admin_training_programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT,
    description TEXT,
    overview TEXT,
    target_audience TEXT,
    program_structure TEXT,
    weekly_schedule TEXT,
    progression_plan TEXT,
    nutrition_tips TEXT,
    expected_results TEXT,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    tier_required TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on programs
ALTER TABLE public.admin_training_programs ENABLE ROW LEVEL SECURITY;

-- Programs are visible to everyone but only admins can modify
CREATE POLICY "Anyone can view programs"
ON public.admin_training_programs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert programs"
ON public.admin_training_programs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update programs"
ON public.admin_training_programs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete programs"
ON public.admin_training_programs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_admin_workouts_updated_at
BEFORE UPDATE ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_admin_training_programs_updated_at
BEFORE UPDATE ON public.admin_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();