-- Add profile fields for fitness data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS fitness_goal TEXT,
ADD COLUMN IF NOT EXISTS equipment_preferences TEXT[],
ADD COLUMN IF NOT EXISTS has_completed_profile BOOLEAN DEFAULT false;

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Update existing profiles to have has_completed_profile as false
UPDATE public.profiles SET has_completed_profile = false WHERE has_completed_profile IS NULL;