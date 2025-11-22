-- Fix Security Warning 1: Move extensions out of public schema
-- Create dedicated extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move uuid-ossp extension if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
  ) THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
END $$;

-- Move pg_trgm extension if it exists  
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) THEN
    ALTER EXTENSION "pg_trgm" SET SCHEMA extensions;
  END IF;
END $$;

-- Update search path to include extensions schema
ALTER DATABASE postgres SET search_path TO public, extensions;