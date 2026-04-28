-- Remove duplicate triggers created during the audit pass.
-- Existing original triggers remain in place.
DROP TRIGGER IF EXISTS trg_admin_workouts_sync_difficulty ON public.admin_workouts;
DROP TRIGGER IF EXISTS trg_admin_workouts_micro_rules ON public.admin_workouts;
DROP TRIGGER IF EXISTS trg_admin_workouts_format_rules ON public.admin_workouts;
DROP TRIGGER IF EXISTS trg_admin_workouts_public_integrity ON public.admin_workouts;
DROP TRIGGER IF EXISTS trg_admin_workouts_queue_notification ON public.admin_workouts;
DROP TRIGGER IF EXISTS trg_admin_workouts_queue_image_repair ON public.admin_workouts;

DROP TRIGGER IF EXISTS trg_admin_programs_public_integrity ON public.admin_training_programs;
DROP TRIGGER IF EXISTS trg_admin_programs_queue_notification ON public.admin_training_programs;
DROP TRIGGER IF EXISTS trg_admin_programs_queue_image_repair ON public.admin_training_programs;

DROP TRIGGER IF EXISTS trg_blog_articles_queue_notification ON public.blog_articles;