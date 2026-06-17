
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public read access for ritual images" ON storage.objects;
CREATE POLICY "Public read access for ritual images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ritual-images');

DROP POLICY IF EXISTS "Admins can update ritual images" ON storage.objects;
CREATE POLICY "Admins can update ritual images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ritual-images' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'ritual-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can delete ritual images" ON storage.objects;
CREATE POLICY "Admins can delete ritual images" ON storage.objects
  FOR DELETE USING (bucket_id = 'ritual-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
