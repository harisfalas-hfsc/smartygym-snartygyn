-- Clean up ALL existing dashboard messages that contain "Day X" patterns
-- Replace "Day 1", "Day 43", etc. with "Daily" in both subject and content

UPDATE user_system_messages 
SET 
  content = REGEXP_REPLACE(content, '<strong>Day\s*\d+</strong>', '<strong>Daily</strong>', 'gi'),
  subject = REGEXP_REPLACE(subject, 'Day\s*\d+', 'Daily', 'gi')
WHERE content ~* 'Day\s*\d+' OR subject ~* 'Day\s*\d+';

-- Also clean any remaining {day_number} placeholders that weren't replaced
UPDATE user_system_messages 
SET 
  content = REGEXP_REPLACE(content, '\{day_number\}', 'Daily', 'gi'),
  subject = REGEXP_REPLACE(subject, '\{day_number\}', 'Daily', 'gi')
WHERE content LIKE '%{day_number}%' OR subject LIKE '%{day_number}%';

-- Clean notification_audit_log as well
UPDATE notification_audit_log 
SET 
  content = REGEXP_REPLACE(content, '<strong>Day\s*\d+</strong>', '<strong>Daily</strong>', 'gi'),
  subject = REGEXP_REPLACE(subject, 'Day\s*\d+', 'Daily', 'gi')
WHERE content ~* 'Day\s*\d+' OR subject ~* 'Day\s*\d+';

UPDATE notification_audit_log 
SET 
  content = REGEXP_REPLACE(content, '\{day_number\}', 'Daily', 'gi'),
  subject = REGEXP_REPLACE(subject, '\{day_number\}', 'Daily', 'gi')
WHERE content LIKE '%{day_number}%' OR subject LIKE '%{day_number}%';