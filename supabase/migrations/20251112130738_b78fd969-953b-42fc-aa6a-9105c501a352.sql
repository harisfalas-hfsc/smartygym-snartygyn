-- Add inactivity_timeout_minutes to system_settings if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES (
  'inactivity_timeout_minutes',
  '30',
  'Number of minutes before automatic logout due to inactivity'
)
ON CONFLICT (setting_key) DO NOTHING;