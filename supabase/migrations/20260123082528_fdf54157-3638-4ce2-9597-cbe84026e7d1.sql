-- Add RLS policy to allow users to delete their own contact messages
CREATE POLICY "Users can delete their own contact messages"
ON contact_messages 
FOR DELETE 
USING (auth.uid() = user_id);