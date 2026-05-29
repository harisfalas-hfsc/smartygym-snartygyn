REVOKE ALL ON FUNCTION public.get_cron_heartbeat_snapshot() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_cron_heartbeat_snapshot() TO service_role;

REVOKE ALL ON FUNCTION public.sync_cron_metadata_from_live_scheduler() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_cron_metadata_from_live_scheduler() TO service_role;