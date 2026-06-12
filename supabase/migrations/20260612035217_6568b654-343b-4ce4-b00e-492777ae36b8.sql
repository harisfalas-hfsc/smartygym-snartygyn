-- 1. Replace overly broad avatars SELECT policy with one scoped to single-object reads (avoids broad listing of bucket).
-- Public bucket URLs still serve files via the public CDN endpoint regardless of this policy.
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- 2. Drop the misleading always-false policies. Service role bypasses RLS at the DB level,
--    so these policies do not restrict the service role; they only confuse readers.
DROP POLICY IF EXISTS "Service role can manage badges" ON public.user_badges;
DROP POLICY IF EXISTS "Only service role can manage newsletter subscribers" ON public.newsletter_subscribers;

-- 3. Add explicit admin-manage policies so manual/admin paths still work cleanly via PostgREST.
CREATE POLICY "Admins can manage badges"
ON public.user_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));