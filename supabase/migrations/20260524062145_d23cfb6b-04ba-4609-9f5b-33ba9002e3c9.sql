
-- 1. workout_comments: require auth to view
DROP POLICY IF EXISTS "Anyone can view comments" ON public.workout_comments;
CREATE POLICY "Authenticated users can view comments"
ON public.workout_comments
FOR SELECT
TO authenticated
USING (true);

-- 2. SECURITY DEFINER functions: revoke broad EXECUTE, grant only where needed

-- 2a. Highly sensitive: service_role only
REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_cron_jobs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_cron_jobs() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.pg_cron_enabled() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_website_analytics_summary(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC, anon, authenticated;

-- 2b. Trigger-only functions: revoke direct EXECUTE (triggers still fire as table owner)
REVOKE EXECUTE ON FUNCTION public.sync_difficulty_from_stars() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_program_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_workout_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_article_notification() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_micro_workout_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_auto_generate_workout_image() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_image_repair_if_needed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_welcome_email_on_confirm() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_welcome_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_public_workout_integrity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_public_program_integrity() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_workout_format_rules() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.queue_program_image_repair_if_needed() FROM PUBLIC, anon, authenticated;

-- 2c. User-facing functions: revoke from anon, keep for authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role_check(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_premium_subscription(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_active_premium_access(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_has_purchased_content(uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_user_banned(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_profile_display_names(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role_check(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_premium_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_active_premium_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_purchased_content(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_banned(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_display_names(uuid[]) TO authenticated;

-- (Public-facing read functions like testimonials, leaderboards, ratings, visible metadata
-- intentionally keep their default PUBLIC EXECUTE — they only return non-sensitive aggregated data.)

-- 3. Storage: drop broad listing policies on public buckets.
-- Public URLs continue to work because they bypass RLS via the storage public endpoint.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view exercise GIFs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ritual images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view app store assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view promotional videos" ON storage.objects;
