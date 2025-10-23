-- Fix 1: Restrict profiles table to owner-only access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fix 2: Add explicit deny policies for user_subscriptions to prevent tampering
CREATE POLICY "Users cannot insert subscriptions" ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Users cannot update subscriptions" ON public.user_subscriptions
  FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete subscriptions" ON public.user_subscriptions
  FOR DELETE
  USING (false);

-- Fix 3: Remove public insert access to newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Fix 4: Create rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(identifier, endpoint, window_start)
);

-- Enable RLS on rate_limits (only edge functions with service role can access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, endpoint, window_start);