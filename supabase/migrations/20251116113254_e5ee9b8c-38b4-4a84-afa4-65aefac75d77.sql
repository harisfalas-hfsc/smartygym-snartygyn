-- Add is_ongoing column to program_interactions table
ALTER TABLE program_interactions 
ADD COLUMN is_ongoing boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN program_interactions.is_ongoing IS 'Indicates if a training program is currently in progress (started but not completed)';