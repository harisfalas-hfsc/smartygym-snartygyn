-- Add first-purchase welcome template for first-time buyers
INSERT INTO public.automated_message_templates (
  template_name,
  message_type,
  subject,
  content,
  is_active,
  is_default,
  target_audience
) VALUES (
  'First Purchase Welcome',
  'welcome',
  '🎉 Welcome to the SmartyGym Family!',
  '<p class="tiptap-paragraph"><strong>Welcome to the SmartyGym Family!</strong></p>
<p class="tiptap-paragraph">Thank you for making your first purchase and trusting SmartyGym with your fitness journey. This is a big step, and we''re honored to be part of it.</p>
<p class="tiptap-paragraph"><strong>What Makes SmartyGym Different:</strong></p>
<p class="tiptap-paragraph">Every workout and training program on SmartyGym is expertly designed by Haris Falas, a Sports Scientist with over 20 years of coaching experience and CSCS certification. You''re not getting generic AI-generated content – you''re getting real expertise from a real professional.</p>
<p class="tiptap-paragraph"><strong>What You Now Have Access To:</strong></p>
<p class="tiptap-paragraph">• Expert-designed workouts crafted for real results</p>
<p class="tiptap-paragraph">• Strategic training programs based on proven methodologies</p>
<p class="tiptap-paragraph">• Daily Workout of the Day following smart periodization</p>
<p class="tiptap-paragraph">• A community of like-minded fitness enthusiasts</p>
<p class="tiptap-paragraph"><strong>Getting Started:</strong></p>
<p class="tiptap-paragraph">Head to your dashboard to explore your new content and start your transformation today. If you have any questions, our team is here to help.</p>
<p class="tiptap-paragraph">Welcome aboard – let''s make it happen!</p>
<p class="tiptap-paragraph"><em>The SmartyGym Team</em></p>',
  true,
  true,
  'all'
) ON CONFLICT DO NOTHING;