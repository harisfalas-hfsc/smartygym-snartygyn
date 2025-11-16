-- Create table for social media analytics tracking
CREATE TABLE IF NOT EXISTS public.social_media_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  referral_source TEXT NOT NULL, -- facebook, instagram, tiktok, youtube, direct, other
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  landing_page TEXT,
  event_type TEXT NOT NULL, -- visit, signup, subscription_purchase, standalone_purchase, workout_view, program_view
  event_value NUMERIC DEFAULT 0, -- monetary value for purchases
  device_type TEXT,
  browser_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_social_analytics_referral ON public.social_media_analytics(referral_source);
CREATE INDEX idx_social_analytics_event ON public.social_media_analytics(event_type);
CREATE INDEX idx_social_analytics_date ON public.social_media_analytics(created_at);
CREATE INDEX idx_social_analytics_user ON public.social_media_analytics(user_id);
CREATE INDEX idx_social_analytics_session ON public.social_media_analytics(session_id);

-- Enable RLS
ALTER TABLE public.social_media_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert analytics events"
  ON public.social_media_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only admins can view analytics"
  ON public.social_media_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update analytics"
  ON public.social_media_analytics
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete analytics"
  ON public.social_media_analytics
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));