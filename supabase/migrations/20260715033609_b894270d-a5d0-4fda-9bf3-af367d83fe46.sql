
-- 1. Tighten contact_messages INSERT policy to prevent user_id spoofing
DROP POLICY IF EXISTS "Anyone can send contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can send contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- 2. Drop overly-broad SELECT policies on public storage buckets to disable listing.
-- Public read via /storage/v1/object/public/... URLs continues to work because
-- public buckets bypass RLS for direct object fetches.
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for ritual images" ON storage.objects;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND cmd='SELECT'
      AND qual ~* 'bucket_id\s*=\s*''(blog-images|exercise-gifs|promotional-videos|app-store-assets)'''
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', p.policyname);
  END LOOP;
END $$;
