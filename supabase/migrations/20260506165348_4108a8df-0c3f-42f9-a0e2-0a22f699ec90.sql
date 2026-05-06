-- Restrict system_health_audits INSERT to admins/service role only
DROP POLICY IF EXISTS "Service role can insert audits" ON public.system_health_audits;
CREATE POLICY "Admins and service role can insert audits"
  ON public.system_health_audits FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- Restrict contact_message_history INSERT to admins/service role only
DROP POLICY IF EXISTS "Service role can insert message history" ON public.contact_message_history;
CREATE POLICY "Admins and service role can insert message history"
  ON public.contact_message_history FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );