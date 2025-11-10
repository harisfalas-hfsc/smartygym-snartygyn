-- Create banned_users table
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false
);

-- Create content_flags table
CREATE TABLE public.content_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- 'comment', 'profile', etc.
  content_id UUID NOT NULL,
  flagged_by UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create moderation_actions table
CREATE TABLE public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- 'delete_comment', 'ban_user', 'unban_user', 'dismiss_flag'
  target_type TEXT NOT NULL, -- 'user', 'comment', 'flag'
  target_id UUID NOT NULL,
  moderator_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banned_users
CREATE POLICY "Only admins can view banned users"
ON public.banned_users FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage bans"
ON public.banned_users FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for content_flags
CREATE POLICY "Anyone can flag content"
ON public.content_flags FOR INSERT
WITH CHECK (auth.uid() = flagged_by);

CREATE POLICY "Only admins can view flags"
ON public.content_flags FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update flags"
ON public.content_flags FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for moderation_actions
CREATE POLICY "Only admins can view moderation actions"
ON public.moderation_actions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can log moderation actions"
ON public.moderation_actions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = moderator_id);

-- Create indexes for better performance
CREATE INDEX idx_banned_users_user_id ON public.banned_users(user_id);
CREATE INDEX idx_content_flags_status ON public.content_flags(status);
CREATE INDEX idx_content_flags_content ON public.content_flags(content_type, content_id);
CREATE INDEX idx_moderation_actions_moderator ON public.moderation_actions(moderator_id);

-- Create function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.banned_users
    WHERE user_id = user_id_param
    AND (
      is_permanent = true
      OR (expires_at IS NOT NULL AND expires_at > now())
    )
  )
$$;
