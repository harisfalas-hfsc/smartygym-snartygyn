-- Create strava_connections table
CREATE TABLE public.strava_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id BIGINT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create strava_activities table
CREATE TABLE public.strava_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  distance NUMERIC,
  moving_time INTEGER,
  elapsed_time INTEGER,
  total_elevation_gain NUMERIC,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  average_speed NUMERIC,
  max_speed NUMERIC,
  calories NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, strava_activity_id)
);

-- Enable RLS
ALTER TABLE public.strava_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strava_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strava_connections
CREATE POLICY "Users can view their own Strava connection"
  ON public.strava_connections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Strava connection"
  ON public.strava_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Strava connection"
  ON public.strava_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Strava connection"
  ON public.strava_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for strava_activities
CREATE POLICY "Users can view their own Strava activities"
  ON public.strava_activities
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Strava activities"
  ON public.strava_activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Strava activities"
  ON public.strava_activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on strava_connections
CREATE TRIGGER update_strava_connections_updated_at
  BEFORE UPDATE ON public.strava_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();