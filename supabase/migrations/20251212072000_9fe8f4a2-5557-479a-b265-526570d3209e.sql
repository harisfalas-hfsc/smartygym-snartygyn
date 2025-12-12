-- Add storage policy for anonymous file uploads to contact-files bucket
CREATE POLICY "Anyone can upload contact files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'contact-files');

-- Insert default response templates
INSERT INTO response_templates (name, subject, content, category, is_active)
VALUES 
  (
    'General Acknowledgment',
    'Re: Your Message to SmartyGym',
    'Thank you for reaching out to SmartyGym!

We have received your message and will review it carefully. Our team typically responds within 24-48 hours.

If you have any urgent questions, feel free to reach us via WhatsApp at +35796000620.

Best regards,
The SmartyGym Team',
    'general',
    true
  ),
  (
    'Support Follow-up',
    'Re: Support Request - SmartyGym',
    'Thank you for contacting SmartyGym support.

We understand you need assistance and we''re here to help. We''ve reviewed your message and will provide a detailed response shortly.

In the meantime, you might find helpful information in our FAQ section.

Best regards,
SmartyGym Support Team',
    'support',
    true
  ),
  (
    'Coach Direct Response',
    'Re: Your Question for Coach Haris',
    'Thank you for reaching out directly!

I''ve received your message and appreciate you taking the time to write. I''ll review your question carefully and get back to you with personalized guidance.

Train smart,
Haris Falas
Sports Scientist & Strength Coach',
    'coach_direct',
    true
  ),
  (
    'Subscription Inquiry',
    'Re: Subscription Question - SmartyGym',
    'Thank you for your interest in SmartyGym premium membership!

Our subscription plans provide full access to:
- 500+ Expert-designed workouts
- Complete training programs
- Daily Smarty Rituals
- Smart fitness tools
- Direct coach access (for premium members)

Please visit smartygym.com/pricing for detailed plan information.

Best regards,
The SmartyGym Team',
    'general',
    true
  );