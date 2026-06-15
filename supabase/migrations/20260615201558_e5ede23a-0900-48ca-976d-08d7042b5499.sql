
GRANT INSERT ON public.newsletter_subscribers TO anon;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
GRANT ALL ON public.system_health_events TO service_role;
GRANT SELECT ON public.system_health_events TO authenticated;
