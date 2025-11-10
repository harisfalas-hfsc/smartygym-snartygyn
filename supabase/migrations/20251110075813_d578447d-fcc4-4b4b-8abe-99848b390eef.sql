-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_reminders BOOLEAN DEFAULT true,
  newsletter BOOLEAN DEFAULT true,
  promotional_emails BOOLEAN DEFAULT true,
  renewal_reminders BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT true,
  workout_completion_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better performance
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Create default preferences for existing users
INSERT INTO public.notification_preferences (user_id, workout_reminders, newsletter, promotional_emails, renewal_reminders, community_updates)
SELECT id, true, true, true, true, true
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;