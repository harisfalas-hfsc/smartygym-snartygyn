-- Create function to get website analytics summary with proper aggregation (bypasses row limit)
CREATE OR REPLACE FUNCTION get_website_analytics_summary(
  start_date timestamptz,
  end_date timestamptz
)
RETURNS TABLE (
  total_visits bigint,
  unique_sessions bigint,
  signups bigint,
  total_revenue numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'visit')::bigint as total_visits,
    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'visit')::bigint as unique_sessions,
    COUNT(*) FILTER (WHERE event_type = 'signup')::bigint as signups,
    COALESCE(SUM(event_value) FILTER (WHERE event_type = 'purchase'), 0)::numeric as total_revenue
  FROM social_media_analytics
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
    AND COALESCE(browser_info, '') NOT ILIKE '%ahrefs%';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_website_analytics_summary(timestamptz, timestamptz) TO authenticated;