-- Create daily_smarty_rituals table
CREATE TABLE public.daily_smarty_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_date DATE NOT NULL UNIQUE,
  day_number INTEGER NOT NULL,
  morning_content TEXT NOT NULL,
  midday_content TEXT NOT NULL,
  evening_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_visible BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.daily_smarty_rituals ENABLE ROW LEVEL SECURITY;

-- Public can view ritual metadata (for countdown display)
CREATE POLICY "Anyone can view visible rituals"
ON public.daily_smarty_rituals
FOR SELECT
USING (is_visible = true);

-- Only service role can manage rituals
CREATE POLICY "Only service role can insert rituals"
ON public.daily_smarty_rituals
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Only service role can update rituals"
ON public.daily_smarty_rituals
FOR UPDATE
USING (false);

CREATE POLICY "Only service role can delete rituals"
ON public.daily_smarty_rituals
FOR DELETE
USING (false);

-- Create ritual_purchases table for daily unlocks
CREATE TABLE public.ritual_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ritual_date DATE NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  UNIQUE(user_id, ritual_date)
);

-- Enable RLS
ALTER TABLE public.ritual_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own ritual purchases"
ON public.ritual_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Users cannot insert directly (handled by webhook)
CREATE POLICY "Users cannot insert ritual purchases directly"
ON public.ritual_purchases
FOR INSERT
WITH CHECK (false);

-- Users cannot update/delete purchases
CREATE POLICY "Users cannot update ritual purchases"
ON public.ritual_purchases
FOR UPDATE
USING (false);

CREATE POLICY "Users cannot delete ritual purchases"
ON public.ritual_purchases
FOR DELETE
USING (false);