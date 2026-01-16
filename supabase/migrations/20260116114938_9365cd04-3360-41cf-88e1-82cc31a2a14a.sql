-- Create PAR-Q responses table for storing user health assessments
CREATE TABLE public.parq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  responses JSONB NOT NULL,
  is_cleared BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.parq_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own PAR-Q responses
CREATE POLICY "Users can view their own PAR-Q responses"
  ON public.parq_responses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own PAR-Q responses
CREATE POLICY "Users can insert their own PAR-Q responses"
  ON public.parq_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all PAR-Q responses
CREATE POLICY "Admins can view all PAR-Q responses"
  ON public.parq_responses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));