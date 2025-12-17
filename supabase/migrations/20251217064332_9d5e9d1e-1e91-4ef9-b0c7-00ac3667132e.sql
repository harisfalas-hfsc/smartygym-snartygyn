-- Create scheduled_workouts table for workout scheduling system
CREATE TABLE public.scheduled_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL, -- 'workout' or 'program'
  content_id TEXT NOT NULL,
  content_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  reminder_before_minutes INTEGER DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT false,
  google_calendar_event_id TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'missed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scheduled workouts"
ON public.scheduled_workouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled workouts"
ON public.scheduled_workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled workouts"
ON public.scheduled_workouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled workouts"
ON public.scheduled_workouts
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_scheduled_workouts_user_date ON public.scheduled_workouts(user_id, scheduled_date);
CREATE INDEX idx_scheduled_workouts_status ON public.scheduled_workouts(status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scheduled_workouts_updated_at
BEFORE UPDATE ON public.scheduled_workouts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();