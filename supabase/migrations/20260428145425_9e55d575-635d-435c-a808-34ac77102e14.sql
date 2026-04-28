-- Restore missing public-table automation triggers safely.
-- This avoids touching authentication-owned system tables.

-- Workouts: enforce content rules before save.
DROP TRIGGER IF EXISTS trg_admin_workouts_sync_difficulty ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_sync_difficulty
BEFORE INSERT OR UPDATE OF difficulty_stars ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.sync_difficulty_from_stars();

DROP TRIGGER IF EXISTS trg_admin_workouts_micro_rules ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_micro_rules
BEFORE INSERT OR UPDATE OF category ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_micro_workout_rules();

DROP TRIGGER IF EXISTS trg_admin_workouts_format_rules ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_format_rules
BEFORE INSERT OR UPDATE OF category, format ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_workout_format_rules();

DROP TRIGGER IF EXISTS trg_admin_workouts_public_integrity ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_public_integrity
BEFORE INSERT OR UPDATE OF name, is_workout_of_day, is_standalone_purchase, price, stripe_product_id, stripe_price_id ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.validate_public_workout_integrity();

-- Workouts: queue side effects only after rows are committed.
DROP TRIGGER IF EXISTS trg_admin_workouts_queue_notification ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_queue_notification
AFTER INSERT OR UPDATE OF is_visible ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.queue_workout_notification();

DROP TRIGGER IF EXISTS trg_admin_workouts_queue_image_repair ON public.admin_workouts;
CREATE TRIGGER trg_admin_workouts_queue_image_repair
AFTER INSERT OR UPDATE OF image_url ON public.admin_workouts
FOR EACH ROW
EXECUTE FUNCTION public.queue_image_repair_if_needed();

-- Programs: enforce integrity and queue automation.
DROP TRIGGER IF EXISTS trg_admin_programs_public_integrity ON public.admin_training_programs;
CREATE TRIGGER trg_admin_programs_public_integrity
BEFORE INSERT OR UPDATE OF is_standalone_purchase, price, stripe_product_id, stripe_price_id ON public.admin_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.validate_public_program_integrity();

DROP TRIGGER IF EXISTS trg_admin_programs_queue_notification ON public.admin_training_programs;
CREATE TRIGGER trg_admin_programs_queue_notification
AFTER INSERT OR UPDATE OF is_visible ON public.admin_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.queue_program_notification();

DROP TRIGGER IF EXISTS trg_admin_programs_queue_image_repair ON public.admin_training_programs;
CREATE TRIGGER trg_admin_programs_queue_image_repair
AFTER INSERT OR UPDATE OF image_url ON public.admin_training_programs
FOR EACH ROW
EXECUTE FUNCTION public.queue_program_image_repair_if_needed();

-- Blog articles: queue notifications when articles are published.
DROP TRIGGER IF EXISTS trg_blog_articles_queue_notification ON public.blog_articles;
CREATE TRIGGER trg_blog_articles_queue_notification
AFTER INSERT OR UPDATE OF is_published ON public.blog_articles
FOR EACH ROW
EXECUTE FUNCTION public.queue_article_notification();