
-- 1. email_delivery_log: replace profile-flag-based admin check with role-based check
DROP POLICY IF EXISTS "Admins can view email delivery logs" ON public.email_delivery_log;

CREATE POLICY "Admins can view email delivery logs"
ON public.email_delivery_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. profiles: remove the over-broad SELECT policy. Add a SECURITY DEFINER helper for display-name lookups.
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_profile_display_names(user_ids uuid[])
RETURNS TABLE (user_id uuid, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.full_name
  FROM public.profiles p
  WHERE p.user_id = ANY(user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_profile_display_names(uuid[]) TO anon, authenticated;

-- 3. workout_comments: require auth to view (still exposes user_id, but only to signed-in members)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.workout_comments;

CREATE POLICY "Authenticated users can view comments"
ON public.workout_comments
FOR SELECT
TO authenticated
USING (true);

-- 4. WOD internal tables: drop permissive ALL policies; service role bypasses RLS, admin SELECT policies stay
DROP POLICY IF EXISTS "Service role can manage generation runs" ON public.wod_generation_runs;
CREATE POLICY "Admins can manage generation runs"
ON public.wod_generation_runs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role can manage readiness audits" ON public.wod_readiness_audits;
CREATE POLICY "Admins can manage readiness audits"
ON public.wod_readiness_audits
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role can manage cooldown" ON public.wod_selection_cooldown;
CREATE POLICY "Admins can manage cooldown"
ON public.wod_selection_cooldown
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. contact-files storage bucket: restrict reads to uploader + admins
DROP POLICY IF EXISTS "Anyone can view contact files" ON storage.objects;

CREATE POLICY "Owners can view contact files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'contact-files'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 6. ritual-images storage bucket: only admins can upload
DROP POLICY IF EXISTS "Admins can upload ritual images" ON storage.objects;

CREATE POLICY "Admins can upload ritual images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ritual-images'
  AND has_role(auth.uid(), 'admin'::app_role)
);
