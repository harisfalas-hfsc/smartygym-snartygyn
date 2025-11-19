-- Add direct sale product support to shop_products table
ALTER TABLE shop_products
ADD COLUMN product_type text NOT NULL DEFAULT 'amazon_affiliate',
ADD COLUMN stripe_product_id text,
ADD COLUMN stripe_price_id text,
ADD COLUMN price numeric,
ADD COLUMN stock_quantity integer,
ADD COLUMN is_available boolean DEFAULT true,
ALTER COLUMN amazon_url DROP NOT NULL;

-- Add check constraint for product_type
ALTER TABLE shop_products
ADD CONSTRAINT check_product_type 
CHECK (product_type IN ('amazon_affiliate', 'direct_sale'));

-- Add fulfillment status to user_purchases for order tracking
ALTER TABLE user_purchases
ADD COLUMN fulfillment_status text DEFAULT 'pending',
ADD COLUMN tracking_info text,
ADD COLUMN shipping_address jsonb;

-- Add check constraint for fulfillment_status
ALTER TABLE user_purchases
ADD CONSTRAINT check_fulfillment_status
CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));