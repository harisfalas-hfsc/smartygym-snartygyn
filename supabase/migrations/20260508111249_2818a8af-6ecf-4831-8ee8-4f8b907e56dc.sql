UPDATE public.automated_message_templates
SET
  subject = 'Welcome to SmartyGym — your fitness journey starts now 🎉',
  content = $HTML$<div style="font-family: Arial, Helvetica, sans-serif; color: #0F172A; line-height: 1.6;">
  <h2 style="color: #29B6D2; font-size: 26px; margin: 0 0 8px 0;">Welcome to SmartyGym! 🎉</h2>
  <p style="font-size: 15px; color: #334155; margin: 0 0 18px 0;"><strong>100% Human. 0% AI.</strong> Every workout, program and piece of advice you'll find here is designed by Coach Haris Falas — built on real coaching, science and decades of practice.</p>
  <p style="font-size: 16px; margin: 0 0 22px 0;">We're thrilled to have you here. SmartyGym is more than an app — it's <em>your ultimate backup plan</em> for staying strong, healthy and energetic, wherever life takes you. 💪</p>
  <div style="background: #F0FBFD; border-left: 4px solid #29B6D2; padding: 14px 18px; border-radius: 6px; margin: 0 0 22px 0;">
    <p style="margin: 0; font-size: 14px; color: #0F172A;">🌱 <strong>Our philosophy:</strong> Aging is not optional — <em>how</em> you age is. Train smart, eat with purpose, and build a body that lasts.</p>
  </div>
  <div style="background: #FEF2F2; border: 1px solid #FCA5A5; padding: 14px 18px; border-radius: 6px; margin: 0 0 26px 0;">
    <p style="margin: 0 0 6px 0; font-size: 14px; color: #B91C1C; font-weight: bold;">⚠️ Before your first workout — complete the PAR-Q</p>
    <p style="margin: 0; font-size: 13px; color: #7F1D1D;">A 2-minute health questionnaire so you train safely. <a href="https://smartygym.com/disclaimer#parq" style="color: #B91C1C; font-weight: bold;">Take it now →</a></p>
  </div>
  <h3 style="color: #0F172A; font-size: 18px; margin: 0 0 12px 0;">✨ What's waiting inside</h3>
  <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 0 0 22px 0;">
    <tr><td style="padding: 8px 0; font-size: 14px;">🌅 <strong>Daily Smarty Ritual</strong> — morning, midday & evening routines to anchor your day</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">🔥 <strong>Workout of the Day</strong> — a fresh, expert-designed session every morning</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">🏋️ <strong>500+ Workouts</strong> — strength, HIIT, mobility, Pilates, recovery & more</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">📋 <strong>Training Programs</strong> — structured plans built around an 84-day periodization cycle</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">📚 <strong>Exercise Library</strong> — clear demos, proper form cues, and the "why" behind every move</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">🧮 <strong>Smart Tools</strong> — workout timer, macro calculator, BMR, 1RM, calorie counter</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">📊 <strong>Logbook & Goals</strong> — track every session, hit streaks, see your progress</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">📖 <strong>Blog & Knowledge Hub</strong> — actionable, science-backed articles on training & nutrition</td></tr>
    <tr><td style="padding: 8px 0; font-size: 14px;">🏆 <strong>Community & Leaderboards</strong> — train alongside members worldwide</td></tr>
  </table>
  <div style="text-align: center; margin: 28px 0;">
    <a href="https://smartygym.com/userdashboard" style="display: inline-block; background: #29B6D2; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">Go to Your Dashboard →</a>
  </div>
  <p style="font-size: 14px; color: #475569; margin: 0 0 6px 0;">A small tip to get the most out of SmartyGym:</p>
  <p style="font-size: 14px; color: #475569; margin: 0 0 22px 0;">Start with <strong>today's Workout of the Day</strong>, explore the <strong>Smarty Ritual</strong>, and set one clear <strong>goal</strong> for the next 30 days. Small steps, every day. 🚀</p>
  <p style="font-size: 15px; color: #0F172A; margin: 0 0 4px 0;"><strong>Welcome aboard — let's age strong, together.</strong></p>
  <p style="font-size: 14px; color: #475569; margin: 0;">— Coach Haris Falas & The SmartyGym Team</p>
</div>$HTML$,
  updated_at = now()
WHERE message_type = 'welcome' AND is_default = true AND is_active = true;