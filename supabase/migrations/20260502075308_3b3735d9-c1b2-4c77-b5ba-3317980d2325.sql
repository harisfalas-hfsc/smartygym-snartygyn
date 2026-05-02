-- Fix 1: Make contact-files bucket private + admin-only read policy
UPDATE storage.buckets SET public = false WHERE id = 'contact-files';

DROP POLICY IF EXISTS "Admins read contact files" ON storage.objects;
CREATE POLICY "Admins read contact files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'contact-files' AND public.has_role(auth.uid(), 'admin'));

-- Fix 2: Remove broken cleanup-old-rate-limits cron job
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-rate-limits') THEN
    PERFORM cron.unschedule('cleanup-old-rate-limits');
  END IF;
END $$;

-- Fix 3: Drop duplicate image-generation trigger (keeps auto_generate_workout_image_trigger)
DROP TRIGGER IF EXISTS auto_generate_workout_image_on_insert ON public.admin_workouts;