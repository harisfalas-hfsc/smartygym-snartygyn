
-- 1) contact_message_history: allow owners of the parent contact_message to read their own thread
CREATE POLICY "Users can read history of their own contact messages"
ON public.contact_message_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contact_messages cm
    WHERE cm.id = contact_message_history.contact_message_id
      AND cm.user_id = auth.uid()
  )
);

-- 2) newsletter_subscribers: keep regular users locked out, but let admins manage and let anon subscribe
CREATE POLICY "Admins can read newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update newsletter subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete newsletter subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3) shop_products: hide internal Stripe IDs from public clients via column-level privileges.
-- RLS still allows SELECT, but anon/authenticated cannot read these specific columns.
-- Admin/service operations go through the service role which retains full access.
REVOKE SELECT ON public.shop_products FROM anon, authenticated;
GRANT SELECT (
  id, title, description, category, amazon_url, image_url, price_range,
  is_featured, display_order, created_at, updated_at, product_type,
  price, stock_quantity, is_available
) ON public.shop_products TO anon, authenticated;
