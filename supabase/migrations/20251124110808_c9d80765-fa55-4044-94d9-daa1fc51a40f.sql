-- Insert default motivational templates
INSERT INTO automated_message_templates (message_type, template_name, subject, content, is_active, is_default)
VALUES
  ('motivational_weekly', 'Weekly Motivation - Monday Boost', '💪 Start Your Week Strong!', 
   'Good morning, Champion! 🌟

This is your weekly reminder that every Monday is a fresh opportunity to crush your fitness goals. Last week is behind you - this week is yours to conquer!

💡 Your Monday Motivation:
"The only bad workout is the one that didn''t happen."

Remember why you started. Remember how far you''ve come. And most importantly, remember that you''re capable of more than you think.

Your SmartyGym workouts are waiting for you. Let''s make this week count!

Stay strong,
Coach Haris Falas & The SmartyGym Team', true, true),
  
  ('motivational_weekly', 'Weekly Motivation - Progress Reminder', '🎯 Your Weekly Progress Check', 
   'Hey there, Fitness Warrior! 

It''s Monday - time for your weekly check-in! How did last week go? Whether you crushed every workout or faced some challenges, you''re here, and that''s what matters.

📊 This Week''s Focus:
✓ Consistency over perfection
✓ Progress, not perfection
✓ One workout at a time

Pro Tip from Coach Haris: "Small daily improvements lead to stunning long-term results."

Your customized SmartyGym program is designed specifically for your goals. Trust the process, show up for yourself, and watch the magic happen.

Let''s go! 💪

The SmartyGym Team', true, false),
  
  ('motivational_weekly', 'Weekly Motivation - Challenge Yourself', '🔥 Monday Challenge Accepted?', 
   'Happy Monday, Athlete!

New week = New opportunities to level up your fitness game!

🏆 This Week''s Challenge:
Push yourself 10% harder than last week. That extra rep, that heavier weight, that longer run - it all counts!

Remember: Growth happens outside your comfort zone. Your body is capable of amazing things when you give it the chance to prove itself.

Coach Haris''s Wisdom: "Champions aren''t made in the moment of victory - they''re made in the hundreds of moments when you choose to keep going."

Your SmartyGym workouts are ready. Your goals are waiting. Let''s show this week what you''re made of!

Game on! 🎮

SmartyGym Team', true, false);