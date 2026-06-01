ALTER TABLE public.email_delivery_log DROP CONSTRAINT IF EXISTS email_delivery_log_status_check;
ALTER TABLE public.email_delivery_log ADD CONSTRAINT email_delivery_log_status_check
  CHECK (status IN ('sent', 'success', 'failed', 'skipped'));