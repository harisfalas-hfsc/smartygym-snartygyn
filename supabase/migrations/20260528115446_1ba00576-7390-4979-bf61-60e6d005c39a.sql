
-- Tighten contact-files INSERT: enforce path prefix per user, anonymous uploads into 'anonymous/' only
DROP POLICY IF EXISTS "Anyone can upload contact files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload contact files" ON storage.objects;

CREATE POLICY "Authenticated users upload to own contact-files folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contact-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "Anonymous uploads contact-files to anonymous folder"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'contact-files'
  AND (storage.foldername(name))[1] = 'anonymous'
);

-- Tighten message-attachments INSERT: only admins (used by admin ContactManager only)
DROP POLICY IF EXISTS "Anyone can upload message attachments" ON storage.objects;

CREATE POLICY "Admins can upload message attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND has_role(auth.uid(), 'admin'::app_role)
);
