-- Create role enum (only if doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function
CREATE OR REPLACE FUNCTION public.has_role_check(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policy: Users can read their own roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Only admins can insert/update/delete roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role_check(auth.uid(), 'admin'));

-- Fix RLS for admin_workouts
DROP POLICY IF EXISTS "Public can view free workouts metadata" ON admin_workouts;
DROP POLICY IF EXISTS "Authenticated users can view workouts they can access" ON admin_workouts;

CREATE POLICY "Public can view free workouts metadata"
ON admin_workouts
FOR SELECT
TO public
USING (is_premium = false);

CREATE POLICY "Authenticated users can view workouts they can access"
ON admin_workouts
FOR SELECT
TO authenticated
USING (
  is_premium = false
  OR 
  EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND plan_type IN ('gold', 'platinum')
  )
  OR
  EXISTS (
    SELECT 1 FROM user_purchases
    WHERE user_id = auth.uid()
    AND content_type = 'workout'
    AND content_id = admin_workouts.id
  )
);

-- Fix RLS for admin_training_programs
DROP POLICY IF EXISTS "Public can view free programs metadata" ON admin_training_programs;
DROP POLICY IF EXISTS "Authenticated users can view programs they can access" ON admin_training_programs;

CREATE POLICY "Public can view free programs metadata"
ON admin_training_programs
FOR SELECT
TO public
USING (is_premium = false);

CREATE POLICY "Authenticated users can view programs they can access"
ON admin_training_programs
FOR SELECT
TO authenticated
USING (
  is_premium = false
  OR 
  EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = auth.uid()
    AND status = 'active'
    AND plan_type IN ('gold', 'platinum')
  )
  OR
  EXISTS (
    SELECT 1 FROM user_purchases
    WHERE user_id = auth.uid()
    AND content_type = 'program'
    AND content_id = admin_training_programs.id
  )
);