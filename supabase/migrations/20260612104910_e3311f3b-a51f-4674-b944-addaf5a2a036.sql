-- Cleanup of legacy Gold/Platinum recurring-subscription artifacts.
-- We now sell ONE Premium product (lifetime, one-time). No renewals, no expirations.

-- 1) Remove obsolete automation rules tied to recurring/expiring subscriptions.
DELETE FROM public.automation_rules
WHERE automation_key IN (
  'subscription_expiration',
  'subscription_expired',
  'payment_failed',
  'plan_change',
  'subscription_renewal'
);

-- 2) Remove obsolete automated message templates for renewals/cancellations.
--    These were inactive but kept around as orphans — clean them up.
DELETE FROM public.automated_message_templates
WHERE message_type IN ('renewal_reminder', 'renewal_thank_you', 'cancellation');

-- 3) Remove obsolete cron metadata rows. The cron_metadata_delete_unschedule
--    trigger will automatically unschedule the corresponding pg_cron jobs.
DELETE FROM public.cron_job_metadata
WHERE job_name IN (
  'expire-admin-subscriptions',
  'backfill-subscription-payment-methods-weekly',
  'send-renewal-reminders-daily',
  'send-subscription-expired-notifications-job',
  'sync-stripe-subscription-status-daily',
  'auto-finalize-draft-invoices-hourly',
  'auto-finalize-stripe-invoices-4h'
);
