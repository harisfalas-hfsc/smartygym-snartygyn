-- Add missing template for purchase_subscription message type
INSERT INTO automated_message_templates (message_type, template_name, subject, content, is_active, is_default)
VALUES 
  ('purchase_subscription', 'First Purchase Welcome', 'Welcome to SmartyGym Premium! 🎉', 
   'Congratulations on your first purchase! You now have access to all premium features including exclusive workouts, training programs, and personalized content. Your fitness journey just got a major upgrade!',
   true, true)
ON CONFLICT DO NOTHING;

-- Add template for morning_wod if not exists
INSERT INTO automated_message_templates (message_type, template_name, subject, content, is_active, is_default)
VALUES 
  ('morning_wod', 'Morning WOD Notification', '🏋️ Your Workout of the Day is Ready!', 
   'Good morning! Your workout of the day is ready. Today''s focus: {category}. Duration: approximately {duration}. Get ready to crush it!',
   true, true)
ON CONFLICT DO NOTHING;

-- Add template for morning_wod_recovery
INSERT INTO automated_message_templates (message_type, template_name, subject, content, is_active, is_default)
VALUES 
  ('morning_wod_recovery', 'Recovery Day WOD Notification', '🧘 Recovery Day - One Gentle Workout Ready!', 
   'Good morning! Today is a recovery day. We have one gentle {category} workout ready for you. Take it easy, focus on form, and let your body recover while staying active.',
   true, true)
ON CONFLICT DO NOTHING;

-- Add template for morning_ritual
INSERT INTO automated_message_templates (message_type, template_name, subject, content, is_active, is_default)
VALUES 
  ('morning_ritual', 'Morning Ritual Notification', '✨ Day {day_number} Smarty Ritual is Ready!', 
   'Good morning! Your Day {day_number} Smarty Ritual is ready. Start your day with mindful practices designed to boost your energy and focus.',
   true, true)
ON CONFLICT DO NOTHING;