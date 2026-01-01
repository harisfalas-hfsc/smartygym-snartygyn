-- Insert default templates for morning notifications with editable placeholders
INSERT INTO automated_message_templates (template_name, message_type, subject, content, is_active, is_default)
VALUES 
  -- Morning WOD template (for regular days with 2 workouts)
  (
    'Morning WOD Notification',
    'morning_wod',
    '🏆 Today''s Workout of the Day: {category}',
    '<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your daily fitness content is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🏆 TODAY''S WORKOUTS OF THE DAY</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today is <strong>{category}</strong> day with TWO workout options:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🏠 No Equipment:</strong> {bodyweight_name}</p>
<p class="tiptap-paragraph"><strong>🏋️ With Equipment:</strong> {equipment_name}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">{format} | {difficulty} ({difficulty_stars}⭐)</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today''s Workouts →</a></p>',
    true,
    true
  ),
  -- Morning WOD Recovery template (for recovery days with 1 workout)
  (
    'Morning WOD Recovery Notification',
    'morning_wod_recovery',
    '🧘 Today''s Recovery Workout: {workout_name}',
    '<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your daily recovery workout is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🧘 TODAY''S RECOVERY WORKOUT</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Today is <strong>Recovery</strong> day with one gentle workout:</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>🧘 Recovery:</strong> {workout_name}</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">{format} | All Levels</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod">View Today''s Workout →</a></p>',
    true,
    true
  ),
  -- Morning Ritual template
  (
    'Morning Ritual Notification',
    'morning_ritual',
    '🌅 Day {day_number} Smarty Ritual',
    '<p class="tiptap-paragraph"><strong>🌅 Good Morning, Smarty!</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"><strong>🌅 YOUR DAILY SMARTY RITUAL</strong></p>
<p class="tiptap-paragraph"><strong>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</strong></p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Your <strong>Day {day_number}</strong> Smarty Ritual is ready!</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph">Start your day with intention through our three wellness rituals:</p>
<p class="tiptap-paragraph">☀️ <strong>Morning</strong> - Energize your start</p>
<p class="tiptap-paragraph">🌤️ <strong>Midday</strong> - Recharge and refocus</p>
<p class="tiptap-paragraph">🌙 <strong>Evening</strong> - Wind down peacefully</p>
<p class="tiptap-paragraph"></p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/daily-ritual">View Today''s Ritual →</a></p>',
    true,
    true
  )
ON CONFLICT DO NOTHING;