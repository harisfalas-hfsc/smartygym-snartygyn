-- Create smarty_checkins table
CREATE TABLE public.smarty_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checkin_date DATE NOT NULL,
  
  -- Morning fields
  morning_completed BOOLEAN DEFAULT false,
  morning_completed_at TIMESTAMPTZ,
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 12),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 10),
  soreness_rating INTEGER CHECK (soreness_rating BETWEEN 0 AND 10),
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  
  -- Night fields
  night_completed BOOLEAN DEFAULT false,
  night_completed_at TIMESTAMPTZ,
  steps_value INTEGER,
  steps_bucket INTEGER CHECK (steps_bucket BETWEEN 1 AND 5),
  hydration_liters NUMERIC(3,1) CHECK (hydration_liters >= 0 AND hydration_liters <= 6),
  protein_level INTEGER CHECK (protein_level BETWEEN 0 AND 4),
  day_strain INTEGER CHECK (day_strain BETWEEN 0 AND 10),
  
  -- Calculated scores (0-10 each)
  sleep_score NUMERIC(4,1),
  readiness_score_norm NUMERIC(4,1),
  soreness_score NUMERIC(4,1),
  mood_score NUMERIC(4,1),
  movement_score NUMERIC(4,1),
  hydration_score NUMERIC(4,1),
  protein_score_norm NUMERIC(4,1),
  day_strain_score NUMERIC(4,1),
  
  -- Final daily score (0-100)
  daily_smarty_score INTEGER,
  score_category TEXT CHECK (score_category IN ('red', 'orange', 'yellow', 'green')),
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('complete', 'incomplete_morning_only', 'incomplete_night_only', 'missed')),
  
  -- Modal shown flags
  morning_modal_shown BOOLEAN DEFAULT false,
  night_modal_shown BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, checkin_date)
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  badge_level TEXT NOT NULL CHECK (badge_level IN ('bronze', 'silver', 'gold', 'special')),
  earned_at TIMESTAMPTZ DEFAULT now(),
  badge_data JSONB,
  UNIQUE(user_id, badge_type, badge_level)
);

-- Add timezone to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN timezone TEXT DEFAULT 'Europe/Athens';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.smarty_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for smarty_checkins
CREATE POLICY "Users can view their own checkins"
ON public.smarty_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
ON public.smarty_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
ON public.smarty_checkins FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
ON public.smarty_checkins FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage badges"
ON public.user_badges FOR ALL
USING (false)
WITH CHECK (false);

-- Create updated_at trigger
CREATE TRIGGER update_smarty_checkins_updated_at
BEFORE UPDATE ON public.smarty_checkins
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_smarty_checkins_user_date ON public.smarty_checkins(user_id, checkin_date);
CREATE INDEX idx_smarty_checkins_date ON public.smarty_checkins(checkin_date);
CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);