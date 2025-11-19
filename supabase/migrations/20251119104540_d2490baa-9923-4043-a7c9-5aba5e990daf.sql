-- Create automated message template for shop product purchases
INSERT INTO public.automated_message_templates (
  template_name,
  message_type,
  subject,
  content,
  is_active,
  is_default
) VALUES (
  'Shop Product Purchase Thank You',
  'purchase_shop_product',
  'Thank You for Your Order!',
  'Hi there! 🎉

Thank you for your purchase of {{contentName}}!

Your order has been successfully processed. You will receive a detailed receipt from Stripe at your registered email address.

Order Details:
• Product: {{contentName}}
• Order Date: {{purchaseDate}}

If you have any questions about your order or need assistance, please don''t hesitate to contact us through the Contact page.

We appreciate your support!

Best regards,
The SmartyGym Team',
  true,
  true
) ON CONFLICT DO NOTHING;