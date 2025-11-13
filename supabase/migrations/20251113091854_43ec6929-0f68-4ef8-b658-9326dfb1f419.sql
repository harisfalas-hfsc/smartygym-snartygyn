-- Add missing stripe_checkout_session_id column to user_purchases table
ALTER TABLE public.user_purchases 
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;