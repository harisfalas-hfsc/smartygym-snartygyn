-- Drop the notification_preferences table
DROP TABLE IF EXISTS public.notification_preferences CASCADE;

-- Remove profile-related columns from profiles table
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS nickname,
  DROP COLUMN IF EXISTS weight,
  DROP COLUMN IF EXISTS height,
  DROP COLUMN IF EXISTS age,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS fitness_level,
  DROP COLUMN IF EXISTS fitness_goals,
  DROP COLUMN IF EXISTS equipment_preferences,
  DROP COLUMN IF EXISTS has_completed_profile;