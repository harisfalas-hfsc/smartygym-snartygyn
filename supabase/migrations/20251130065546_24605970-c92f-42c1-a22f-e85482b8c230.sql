-- Add RLS policy to allow users to delete their own system messages
CREATE POLICY "Users can delete their own system messages"
ON user_system_messages FOR DELETE
USING (auth.uid() = user_id);