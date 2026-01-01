-- Phase 1: Add automation_key column to automated_message_templates
-- This allows us to link templates to specific automation rules

-- Add the automation_key column
ALTER TABLE public.automated_message_templates 
ADD COLUMN IF NOT EXISTS automation_key text;

-- Backfill automation_key for existing templates based on template_name patterns
-- For announcement_update templates (shared message type)
UPDATE public.automated_message_templates
SET automation_key = 'workout_of_day'
WHERE message_type = 'announcement_update' 
  AND (template_name ILIKE '%workout of the day%' OR template_name ILIKE '%wod%')
  AND automation_key IS NULL;

UPDATE public.automated_message_templates
SET automation_key = 'new_addition'
WHERE message_type = 'announcement_update' 
  AND (template_name ILIKE '%new content%' OR template_name ILIKE '%new addition%')
  AND automation_key IS NULL;

UPDATE public.automated_message_templates
SET automation_key = 'plan_change'
WHERE message_type = 'announcement_update' 
  AND template_name ILIKE '%plan change%'
  AND automation_key IS NULL;

-- For morning templates, link to their automation keys
UPDATE public.automated_message_templates
SET automation_key = 'morning_wod'
WHERE message_type = 'morning_wod' AND automation_key IS NULL;

UPDATE public.automated_message_templates
SET automation_key = 'morning_wod_recovery'
WHERE message_type = 'morning_wod_recovery' AND automation_key IS NULL;

UPDATE public.automated_message_templates
SET automation_key = 'morning_ritual'
WHERE message_type = 'morning_ritual' AND automation_key IS NULL;

-- For other specific message types, set automation_key to match message_type
UPDATE public.automated_message_templates
SET automation_key = message_type::text
WHERE automation_key IS NULL 
  AND message_type NOT IN ('announcement_update');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_templates_automation_key 
ON public.automated_message_templates(automation_key);

CREATE INDEX IF NOT EXISTS idx_templates_message_type_automation_key 
ON public.automated_message_templates(message_type, automation_key);