-- Create measurement goals table
CREATE TABLE public.user_measurement_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_weight NUMERIC,
  target_body_fat NUMERIC,
  target_muscle_mass NUMERIC,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_measurement_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals"
ON public.user_measurement_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
ON public.user_measurement_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_measurement_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_measurement_goals
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_measurement_goals_updated_at
BEFORE UPDATE ON public.user_measurement_goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();