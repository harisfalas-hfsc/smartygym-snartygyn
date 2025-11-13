-- Add payment tracking fields to personal_training_requests table
ALTER TABLE personal_training_requests 
ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;