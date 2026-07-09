CREATE OR REPLACE FUNCTION public.get_website_analytics_summary(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS TABLE(total_visits bigint, unique_sessions bigint, signups bigint, total_revenue numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'visit')::bigint as total_visits,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'visit')::bigint as unique_sessions,
    COUNT(*) FILTER (WHERE event_type = 'signup')::bigint as signups,
    COALESCE(SUM(event_value) FILTER (WHERE event_type = 'purchase'), 0)::numeric as total_revenue
  FROM public.social_media_analytics
  WHERE created_at >= start_date 
    AND created_at <= end_date
    AND COALESCE(browser_info, '') NOT ILIKE '%bot%'
    AND COALESCE(browser_info, '') NOT ILIKE '%crawler%'
    AND COALESCE(browser_info, '') NOT ILIKE '%spider%'
    AND COALESCE(browser_info, '') NOT ILIKE '%lovable%'
    AND COALESCE(browser_info, '') NOT ILIKE '%meta-external%'
    AND COALESCE(browser_info, '') NOT ILIKE '%adsbot%'
    AND COALESCE(browser_info, '') NOT ILIKE '%facebookexternalhit%'
    AND COALESCE(browser_info, '') NOT ILIKE '%semrush%'
    AND COALESCE(browser_info, '') NOT ILIKE '%ahrefs%'
    AND COALESCE(landing_page, '') NOT ILIKE '/admin%'
    AND COALESCE(landing_page, '') NOT ILIKE '%/admin%'
    AND COALESCE(landing_page, '') NOT ILIKE '/corporate-admin%';
END;
$function$;