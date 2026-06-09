DO $$
BEGIN
  PERFORM cron.unschedule('stripe-orphan-cleanup-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;