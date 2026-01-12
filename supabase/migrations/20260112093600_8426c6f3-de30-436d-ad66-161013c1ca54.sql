-- Aggressive cleanup of ALL "Day X" patterns in user_system_messages
UPDATE user_system_messages 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(content, '<strong>Day\s*\d+\s*(of\s*)?(Daily\s*)?', '<strong>', 'gi'),
    'Day\s+\d+\s*(of\s*)?(Daily\s*)?', 'Daily ', 'gi'
  ),
  '\{day_number\}', '', 'gi'
),
subject = REGEXP_REPLACE(
  REGEXP_REPLACE(subject, 'Day\s+\d+', 'Daily', 'gi'),
  '\{day_number\}', '', 'gi'
)
WHERE content ~ 'Day\s*\d+' OR content ~ '\{day_number\}' OR subject ~ 'Day\s*\d+' OR subject ~ '\{day_number\}';

-- Also clean notification_audit_log
UPDATE notification_audit_log 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(content, '<strong>Day\s*\d+\s*(of\s*)?(Daily\s*)?', '<strong>', 'gi'),
    'Day\s+\d+\s*(of\s*)?(Daily\s*)?', 'Daily ', 'gi'
  ),
  '\{day_number\}', '', 'gi'
),
subject = REGEXP_REPLACE(
  REGEXP_REPLACE(subject, 'Day\s+\d+', 'Daily', 'gi'),
  '\{day_number\}', '', 'gi'
)
WHERE content ~ 'Day\s*\d+' OR content ~ '\{day_number\}' OR subject ~ 'Day\s*\d+' OR subject ~ '\{day_number\}';