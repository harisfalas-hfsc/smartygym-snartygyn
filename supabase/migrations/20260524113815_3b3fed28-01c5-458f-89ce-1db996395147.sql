
-- 1. Stripe webhook idempotency table
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
  ON public.stripe_webhook_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- No INSERT/UPDATE/DELETE policies: only service role (which bypasses RLS) can write.

-- Optional cleanup helper: auto-delete events older than 30 days via index-friendly column
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON public.stripe_webhook_events (processed_at);

-- 2. Tighten social_media_analytics INSERT policy
DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.social_media_analytics;

CREATE POLICY "Validated public analytics inserts"
  ON public.social_media_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IS NOT NULL
    AND length(event_type) BETWEEN 1 AND 64
    AND event_type ~ '^[a-z0-9_\-]+$'
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 6 AND 128
  );

-- 3. Lock down public.exec_sql explicitly
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM authenticated;
COMMENT ON FUNCTION public.exec_sql(text) IS
  'SERVICE-ROLE ONLY. SECURITY DEFINER. Executes arbitrary SQL. Never grant EXECUTE to anon or authenticated.';
