-- Add RLS policy for newsletter_subscribers (only edge functions can insert via service role)
CREATE POLICY "Only service role can manage newsletter subscribers" ON public.newsletter_subscribers
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Add RLS policy for rate_limits (only edge functions can manage via service role)
CREATE POLICY "Only service role can manage rate limits" ON public.rate_limits
  FOR ALL
  USING (false)
  WITH CHECK (false);