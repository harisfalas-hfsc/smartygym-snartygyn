-- Restrict profiles visibility: Remove public access policy and keep only authenticated user access
DROP POLICY IF EXISTS "Anyone can view public profile info" ON public.profiles;

-- Create a more restrictive policy for authenticated users only
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Add rate limiting for contact form - Add check constraint and index for efficient queries
ALTER TABLE public.rate_limits 
ADD COLUMN IF NOT EXISTS last_request_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for faster rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_endpoint 
ON public.rate_limits (identifier, endpoint, window_start);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INT DEFAULT 5,
  p_window_minutes INT DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_current_count INT;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Clean up old entries
  DELETE FROM rate_limits 
  WHERE window_start < v_window_start;
  
  -- Get current count for this identifier/endpoint
  SELECT request_count INTO v_current_count
  FROM rate_limits
  WHERE identifier = p_identifier 
    AND endpoint = p_endpoint
    AND window_start >= v_window_start
  ORDER BY window_start DESC
  LIMIT 1;
  
  IF v_current_count IS NULL THEN
    -- First request in window
    INSERT INTO rate_limits (identifier, endpoint, request_count, window_start)
    VALUES (p_identifier, p_endpoint, 1, NOW());
    RETURN TRUE;
  ELSIF v_current_count >= p_max_requests THEN
    -- Rate limit exceeded
    RETURN FALSE;
  ELSE
    -- Increment counter
    UPDATE rate_limits 
    SET request_count = request_count + 1,
        last_request_at = NOW()
    WHERE identifier = p_identifier 
      AND endpoint = p_endpoint
      AND window_start >= v_window_start;
    RETURN TRUE;
  END IF;
END;
$$;