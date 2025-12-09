-- Backfill existing check-ins into user_activity_log
-- Insert morning check-ins
INSERT INTO user_activity_log (user_id, content_type, item_id, item_name, action_type, activity_date, tool_result, created_at)
SELECT 
  user_id,
  'checkin',
  id::text,
  'Morning Check-in',
  'completed',
  checkin_date,
  jsonb_build_object('type', 'morning'),
  COALESCE(morning_completed_at, created_at)
FROM smarty_checkins
WHERE morning_completed = true
AND NOT EXISTS (
  SELECT 1 FROM user_activity_log 
  WHERE user_activity_log.item_id = smarty_checkins.id::text 
  AND user_activity_log.content_type = 'checkin'
  AND user_activity_log.item_name = 'Morning Check-in'
);

-- Insert night check-ins
INSERT INTO user_activity_log (user_id, content_type, item_id, item_name, action_type, activity_date, tool_result, created_at)
SELECT 
  user_id,
  'checkin',
  id::text,
  'Night Check-in',
  'completed',
  checkin_date,
  jsonb_build_object('type', 'night', 'score', daily_smarty_score, 'category', score_category),
  COALESCE(night_completed_at, created_at)
FROM smarty_checkins
WHERE night_completed = true
AND NOT EXISTS (
  SELECT 1 FROM user_activity_log 
  WHERE user_activity_log.item_id = smarty_checkins.id::text 
  AND user_activity_log.content_type = 'checkin'
  AND user_activity_log.item_name = 'Night Check-in'
);