CREATE TABLE IF NOT EXISTS public.stripe_sync_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  scope text NOT NULL,
  total int NOT NULL,
  ok_count int NOT NULL,
  broken_count int NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  issues jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.stripe_sync_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read stripe_sync_audit"
ON public.stripe_sync_audit FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert stripe_sync_audit"
ON public.stripe_sync_audit FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));