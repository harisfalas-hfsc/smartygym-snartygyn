-- Bug C: Expire stale admin-granted subscription past its period_end
UPDATE public.user_subscriptions
SET status = 'expired', updated_at = now()
WHERE id = 'e0b76685-5110-483e-9ae6-8bdcf53601e8'
  AND status = 'active'
  AND current_period_end < now();
