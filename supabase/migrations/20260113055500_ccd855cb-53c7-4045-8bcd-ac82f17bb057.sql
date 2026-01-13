
-- The wod_generation_runs already has the proper admin policy
-- Just add comments for clarity on intentional public INSERT policies

COMMENT ON POLICY "Anyone can send contact messages" ON public.contact_messages IS 'Intentionally public - allows anonymous users to submit contact forms';

COMMENT ON POLICY "Anyone can insert analytics events" ON public.social_media_analytics IS 'Intentionally public - allows tracking anonymous visits for analytics';

COMMENT ON POLICY "Service role can insert audits" ON public.system_health_audits IS 'Intentionally public for edge functions - only edge functions use this';

COMMENT ON POLICY "Service role can insert message history" ON public.contact_message_history IS 'Service role only - used by edge functions for logging';
