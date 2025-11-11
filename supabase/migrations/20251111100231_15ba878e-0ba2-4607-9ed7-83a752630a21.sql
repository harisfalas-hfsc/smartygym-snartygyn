-- Add pricing and purchase fields to admin_workouts
ALTER TABLE public.admin_workouts 
ADD COLUMN IF NOT EXISTS is_standalone_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add pricing and purchase fields to admin_training_programs
ALTER TABLE public.admin_training_programs 
ADD COLUMN IF NOT EXISTS is_standalone_purchase BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Create user_purchases table to track individual workout/program purchases
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('workout', 'program', 'personal_training')),
  content_id TEXT NOT NULL,
  content_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS on user_purchases
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_purchases
CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users cannot insert purchases directly"
ON public.user_purchases
FOR INSERT
WITH CHECK (false);

-- Create personal_training_requests table
CREATE TABLE IF NOT EXISTS public.personal_training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  weight NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  fitness_level TEXT NOT NULL,
  lifestyle TEXT[] NOT NULL,
  performance_type TEXT NOT NULL,
  specific_goal TEXT NOT NULL,
  duration TEXT NOT NULL,
  training_days TEXT NOT NULL,
  workout_duration TEXT NOT NULL,
  equipment TEXT[] NOT NULL,
  other_equipment TEXT,
  limitations TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_status TEXT
);

-- Enable RLS on personal_training_requests
ALTER TABLE public.personal_training_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for personal_training_requests
CREATE POLICY "Users can view their own requests"
ON public.personal_training_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create requests"
ON public.personal_training_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
ON public.personal_training_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update requests"
ON public.personal_training_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create personal_training_programs table (similar to admin_training_programs but for individual users)
CREATE TABLE IF NOT EXISTS public.personal_training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.personal_training_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT,
  difficulty_stars INTEGER DEFAULT 1,
  duration TEXT,
  days_per_week INTEGER,
  weeks INTEGER,
  equipment TEXT,
  serial_number TEXT,
  image_url TEXT,
  overview TEXT,
  target_audience TEXT,
  training_program TEXT,
  construction TEXT,
  progression_plan TEXT,
  tips TEXT,
  expected_results TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on personal_training_programs
ALTER TABLE public.personal_training_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for personal_training_programs
CREATE POLICY "Users can view their own personal training programs"
ON public.personal_training_programs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all personal training programs"
ON public.personal_training_programs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update triggers for updated_at
CREATE OR REPLACE TRIGGER update_personal_training_programs_updated_at
BEFORE UPDATE ON public.personal_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();