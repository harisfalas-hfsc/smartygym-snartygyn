-- Add content_deleted column to user_purchases for soft-delete
ALTER TABLE user_purchases 
ADD COLUMN content_deleted boolean DEFAULT false;

-- Add index for efficient filtering
CREATE INDEX idx_user_purchases_content_deleted 
ON user_purchases(user_id, content_deleted);

-- Add comment for documentation
COMMENT ON COLUMN user_purchases.content_deleted IS 'Soft-delete flag: true when the purchased content has been deleted by admin. Preserves purchase history for accounting while preventing access to deleted content.';