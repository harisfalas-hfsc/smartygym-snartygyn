-- Create Subscription Cancellation template
INSERT INTO automated_message_templates (
  template_name,
  message_type,
  subject,
  content,
  is_active,
  target_audience
) VALUES (
  'Subscription Cancellation',
  'cancellation',
  '😢 We''re Sorry to See You Go',
  '<p class="tiptap-paragraph"><strong>Your Subscription Has Been Cancelled</strong></p>
<p class="tiptap-paragraph">We''re sorry to see you go. Your subscription has been successfully cancelled.</p>
<p class="tiptap-paragraph"><strong>What Happens Next:</strong></p>
<p class="tiptap-paragraph">You will continue to have full access to all your premium content until <strong>{endDate}</strong>. After that date, your account will revert to free tier access.</p>
<p class="tiptap-paragraph"><strong>We''d Love to Have You Back:</strong></p>
<p class="tiptap-paragraph">If you ever decide to return, your fitness journey awaits. All our expert-designed workouts and training programs will be here for you.</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/pricing" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Resubscribe Anytime →</a></p>
<p class="tiptap-paragraph">Thank you for being part of the SmartyGym family. We wish you all the best in your fitness journey!</p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>',
  true,
  'all'
);

-- Update Monday Motivational with consistent formatting
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>Happy Monday, Champion! 💪</strong></p>
<p class="tiptap-paragraph">A new week means new opportunities to become stronger, healthier, and more confident.</p>
<p class="tiptap-paragraph"><strong>Remember:</strong></p>
<p class="tiptap-paragraph">• Every workout counts</p>
<p class="tiptap-paragraph">• Every healthy choice matters</p>
<p class="tiptap-paragraph">• Every step forward is progress</p>
<p class="tiptap-paragraph">Your body is your most valuable investment. Train consistently, eat well, rest properly, and watch yourself transform.</p>
<p class="tiptap-paragraph">Let''s make this week count!</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Start Training →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'Monday Motivational';

-- Update New Content Notification with consistent formatting
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>🔥 New Content Just Added!</strong></p>
<p class="tiptap-paragraph">We have just added exciting new content to SmartyGym:</p>
<p class="tiptap-paragraph"><strong>{title}</strong></p>
<p class="tiptap-paragraph">{description}</p>
<p class="tiptap-paragraph">Don''t miss out – check it out now!</p>
<p class="tiptap-paragraph"><a href="{link}" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Now →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'New Content Notification';

-- Update Plan Change Notification with consistent formatting
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>📋 Your Plan Has Been Updated</strong></p>
<p class="tiptap-paragraph">Your subscription has been successfully updated.</p>
<p class="tiptap-paragraph"><strong>New Plan:</strong> {planName}</p>
<p class="tiptap-paragraph">Your changes are now active. Enjoy all the benefits of your {planName} membership!</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'Plan Change Notification';

-- Update Subscription Expiration Reminder with consistent formatting and CTA
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>⏰ Your Plan Renews Soon</strong></p>
<p class="tiptap-paragraph">Your {planName} subscription will automatically renew in 3 days on <strong>{date}</strong>.</p>
<p class="tiptap-paragraph">No action is needed if you wish to continue enjoying your premium benefits.</p>
<p class="tiptap-paragraph"><strong>Your Premium Benefits Include:</strong></p>
<p class="tiptap-paragraph">• Access to 500+ expert workouts</p>
<p class="tiptap-paragraph">• All training programs</p>
<p class="tiptap-paragraph">• Daily Workout of the Day</p>
<p class="tiptap-paragraph">• Priority support</p>
<p class="tiptap-paragraph">Thank you for being part of the SmartyGym family!</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Dashboard →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'Subscription Expiration Reminder';

-- Update Subscription Renewal Confirmation with consistent formatting
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>✅ Subscription Renewed Successfully</strong></p>
<p class="tiptap-paragraph">Thank you for continuing your fitness journey with SmartyGym!</p>
<p class="tiptap-paragraph">Your <strong>{planName}</strong> subscription has been renewed successfully. You have unlimited access to all premium content.</p>
<p class="tiptap-paragraph"><strong>Continue Your Journey:</strong></p>
<p class="tiptap-paragraph">• Explore new workouts added this week</p>
<p class="tiptap-paragraph">• Check out today''s Workout of the Day</p>
<p class="tiptap-paragraph">• Track your progress on your dashboard</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/dashboard" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Go to Dashboard →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'Subscription Renewal Confirmation';

-- Update Workout of the Day with consistent formatting
UPDATE automated_message_templates 
SET content = '<p class="tiptap-paragraph"><strong>🏆 Your Daily Workout is Ready!</strong></p>
<p class="tiptap-paragraph">Good morning! Today''s expert-designed Workout of the Day is waiting for you.</p>
<p class="tiptap-paragraph">{description}</p>
<p class="tiptap-paragraph">Make today count – your future self will thank you!</p>
<p class="tiptap-paragraph"><a href="https://smartygym.com/workout/wod" style="display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Today''s Workout →</a></p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>'
WHERE template_name = 'Workout of the Day';