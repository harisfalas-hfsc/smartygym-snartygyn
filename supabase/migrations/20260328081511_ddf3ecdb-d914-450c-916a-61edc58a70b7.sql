UPDATE automated_message_templates
SET 
  content = REPLACE(
    content,
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured weekly periodization cycle:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Monday</strong> — Strength &amp; Power</li>
  <li>🟠 <strong>Tuesday</strong> — HIIT &amp; Conditioning</li>
  <li>🟡 <strong>Wednesday</strong> — Core &amp; Functional</li>
  <li>🟢 <strong>Thursday</strong> — Upper Body Focus</li>
  <li>🔵 <strong>Friday</strong> — Lower Body Focus</li>
  <li>🟣 <strong>Saturday</strong> — Full Body Challenge</li>
  <li>⚪ <strong>Sunday</strong> — Active Recovery &amp; Mobility</li>
</ul>',
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured <strong>84-day periodization super-cycle</strong> that rotates through every training category at varying difficulty levels:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Strength</strong> — Build power &amp; muscle with progressive resistance</li>
  <li>🟠 <strong>Metabolic Conditioning</strong> — High-intensity functional training</li>
  <li>🟡 <strong>Cardio &amp; Endurance</strong> — Improve your aerobic capacity &amp; stamina</li>
  <li>🟢 <strong>Calorie Burning</strong> — Maximum calorie expenditure sessions</li>
  <li>🔵 <strong>Mobility &amp; Stability</strong> — Joint health, flexibility &amp; injury prevention</li>
  <li>⚪ <strong>Recovery</strong> — Active rest &amp; restoration days</li>
</ul>
<p>The cycle adjusts difficulty across <strong>Beginner, Intermediate, and Advanced</strong> levels — so whether you''re just starting or pushing limits, every workout is calibrated for you.</p>'
  ),
  dashboard_content = REPLACE(
    dashboard_content,
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured weekly periodization cycle:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Monday</strong> — Strength &amp; Power</li>
  <li>🟠 <strong>Tuesday</strong> — HIIT &amp; Conditioning</li>
  <li>🟡 <strong>Wednesday</strong> — Core &amp; Functional</li>
  <li>🟢 <strong>Thursday</strong> — Upper Body Focus</li>
  <li>🔵 <strong>Friday</strong> — Lower Body Focus</li>
  <li>🟣 <strong>Saturday</strong> — Full Body Challenge</li>
  <li>⚪ <strong>Sunday</strong> — Active Recovery &amp; Mobility</li>
</ul>',
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured <strong>84-day periodization super-cycle</strong> that rotates through every training category at varying difficulty levels:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Strength</strong> — Build power &amp; muscle with progressive resistance</li>
  <li>🟠 <strong>Metabolic Conditioning</strong> — High-intensity functional training</li>
  <li>🟡 <strong>Cardio &amp; Endurance</strong> — Improve your aerobic capacity &amp; stamina</li>
  <li>🟢 <strong>Calorie Burning</strong> — Maximum calorie expenditure sessions</li>
  <li>🔵 <strong>Mobility &amp; Stability</strong> — Joint health, flexibility &amp; injury prevention</li>
  <li>⚪ <strong>Recovery</strong> — Active rest &amp; restoration days</li>
</ul>
<p>The cycle adjusts difficulty across <strong>Beginner, Intermediate, and Advanced</strong> levels — so whether you''re just starting or pushing limits, every workout is calibrated for you.</p>'
  ),
  email_content = REPLACE(
    email_content,
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured weekly periodization cycle:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Monday</strong> — Strength &amp; Power</li>
  <li>🟠 <strong>Tuesday</strong> — HIIT &amp; Conditioning</li>
  <li>🟡 <strong>Wednesday</strong> — Core &amp; Functional</li>
  <li>🟢 <strong>Thursday</strong> — Upper Body Focus</li>
  <li>🔵 <strong>Friday</strong> — Lower Body Focus</li>
  <li>🟣 <strong>Saturday</strong> — Full Body Challenge</li>
  <li>⚪ <strong>Sunday</strong> — Active Recovery &amp; Mobility</li>
</ul>',
    '<p>Every single day, a <strong>fresh, science-based workout</strong> is waiting for you. It''s not random — each WOD follows a structured <strong>84-day periodization super-cycle</strong> that rotates through every training category at varying difficulty levels:</p>
<ul style="padding-left: 20px;">
  <li>🔴 <strong>Strength</strong> — Build power &amp; muscle with progressive resistance</li>
  <li>🟠 <strong>Metabolic Conditioning</strong> — High-intensity functional training</li>
  <li>🟡 <strong>Cardio &amp; Endurance</strong> — Improve your aerobic capacity &amp; stamina</li>
  <li>🟢 <strong>Calorie Burning</strong> — Maximum calorie expenditure sessions</li>
  <li>🔵 <strong>Mobility &amp; Stability</strong> — Joint health, flexibility &amp; injury prevention</li>
  <li>⚪ <strong>Recovery</strong> — Active rest &amp; restoration days</li>
</ul>
<p>The cycle adjusts difficulty across <strong>Beginner, Intermediate, and Advanced</strong> levels — so whether you''re just starting or pushing limits, every workout is calibrated for you.</p>'
  )
WHERE message_type = 'welcome_onboarding';