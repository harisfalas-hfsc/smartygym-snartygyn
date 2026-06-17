
-- Allow service role (edge functions) to write delivery log entries
CREATE POLICY "Service role can insert email delivery logs"
ON public.email_delivery_log
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update email delivery logs"
ON public.email_delivery_log
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to write campaign log entries
CREATE POLICY "Service role can insert email campaign logs"
ON public.email_campaign_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Admins can view SEO refresh history
CREATE POLICY "Admins can view SEO refresh log"
ON public.seo_refresh_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
