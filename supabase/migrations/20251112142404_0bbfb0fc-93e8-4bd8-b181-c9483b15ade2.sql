-- Fix RLS policies for contact_messages to allow users to view and mark their own messages as read

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Only admins can view contact messages" ON contact_messages;

-- Create new policy allowing users to view their own messages
CREATE POLICY "Users can view their own contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Keep admin view access
CREATE POLICY "Admins can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Only admins can update contact messages" ON contact_messages;

-- Allow users to update only response_read_at on their own messages
CREATE POLICY "Users can mark their own messages as read"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep admin full update access
CREATE POLICY "Admins can update all contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));