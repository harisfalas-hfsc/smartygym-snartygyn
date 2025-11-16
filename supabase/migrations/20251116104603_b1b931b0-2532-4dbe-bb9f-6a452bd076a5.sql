-- Create user_activity_log table for MyLogBook feature
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Activity Classification
  content_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  
  -- Action Type
  action_type TEXT NOT NULL,
  
  -- Program/PT Specific Fields
  program_week INTEGER,
  program_day INTEGER,
  total_weeks INTEGER,
  total_days_per_week INTEGER,
  
  -- Tool Specific Fields (for calculators)
  tool_input JSONB,
  tool_result JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Constraints
  CONSTRAINT valid_content_type CHECK (content_type IN ('workout', 'program', 'personal_training', 'tool')),
  CONSTRAINT valid_action_type CHECK (action_type IN ('viewed', 'completed', 'calculated', 'program_day_completed', 'pt_day_completed', 'program_day_viewed', 'pt_day_viewed', 'missed'))
);

-- Indexes for performance
CREATE INDEX idx_activity_user_id ON user_activity_log(user_id);
CREATE INDEX idx_activity_date ON user_activity_log(activity_date);
CREATE INDEX idx_activity_content_type ON user_activity_log(content_type);
CREATE INDEX idx_activity_user_date ON user_activity_log(user_id, activity_date);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activity log"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity log"
  ON user_activity_log FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity log"
  ON user_activity_log FOR DELETE
  USING (auth.uid() = user_id);