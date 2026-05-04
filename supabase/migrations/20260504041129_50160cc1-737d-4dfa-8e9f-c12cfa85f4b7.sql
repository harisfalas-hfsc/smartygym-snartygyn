DROP FUNCTION IF EXISTS public.get_visible_program_metadata(text);

CREATE OR REPLACE FUNCTION public.get_visible_program_metadata(_program_id text DEFAULT NULL::text)
 RETURNS TABLE(id text, name text, category text, duration text, description text, image_url text, is_premium boolean, tier_required text, difficulty text, equipment text, weeks integer, days_per_week integer, difficulty_stars integer, is_standalone_purchase boolean, price numeric, stripe_product_id text, stripe_price_id text, is_free boolean, is_visible boolean, serial_number integer, created_at timestamptz, updated_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    ap.id, ap.name, ap.category, ap.duration, ap.description, ap.image_url,
    ap.is_premium, ap.tier_required, ap.difficulty, ap.equipment, ap.weeks,
    ap.days_per_week, ap.difficulty_stars, ap.is_standalone_purchase, ap.price,
    ap.stripe_product_id, ap.stripe_price_id, ap.is_free, ap.is_visible,
    ap.serial_number, ap.created_at, ap.updated_at
  FROM public.admin_training_programs ap
  WHERE COALESCE(ap.is_visible, true) = true
    AND (_program_id IS NULL OR ap.id = _program_id);
$function$;