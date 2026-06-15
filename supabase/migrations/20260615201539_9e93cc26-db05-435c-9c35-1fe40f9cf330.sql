
-- Newsletter: allow public subscribe with validation
CREATE POLICY "Anyone can subscribe to newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    active = true
    AND email IS NOT NULL
    AND length(email) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND name IS NOT NULL
    AND length(btrim(name)) BETWEEN 1 AND 100
  );

-- Newsletter: explicit block of non-admin updates/deletes for clarity
CREATE POLICY "Block public update newsletter"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block public delete newsletter"
  ON public.newsletter_subscribers
  FOR DELETE
  TO anon
  USING (false);

-- system_health_events: explicit block writes from anon/authenticated
CREATE POLICY "Block public insert health events"
  ON public.system_health_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Block public update health events"
  ON public.system_health_events
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block public delete health events"
  ON public.system_health_events
  FOR DELETE
  TO anon, authenticated
  USING (false);
