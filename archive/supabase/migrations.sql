-- Premium Features Migration
-- Run this in Supabase SQL Editor to upgrade schema

-- 1. Add vendor_tiers & vendor_tier membership
CREATE TABLE IF NOT EXISTS vendor_tiers (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE, -- e.g., 'Free', 'Premium', 'Featured'
  monthly_price numeric(10,2) DEFAULT 0,
  features jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS tier_id int REFERENCES vendor_tiers(id),
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS short_tagline text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb, -- { "instagram": "...", "website": "..."}
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- 2. Product media table (support multiple images / video)
CREATE TABLE IF NOT EXISTS product_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order int DEFAULT 0,
  media_type text DEFAULT 'image' CHECK (media_type IN ('image','video')),
  created_at timestamptz DEFAULT now()
);

-- 3. SEO + tags + categories for products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS weight_grams int DEFAULT NULL;

-- 4. Inventory reservation table (holds)
CREATE TABLE IF NOT EXISTS inventory_holds (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  order_token uuid NOT NULL, -- temporary token while checkout in progress
  quantity int NOT NULL CHECK (quantity > 0),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_inventory_holds_product_expiry ON inventory_holds (product_id, expires_at);

-- 5. Vendor badges & featured slots
CREATE TABLE IF NOT EXISTS vendor_badges (
  id serial PRIMARY KEY,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  badge_type text NOT NULL, -- 'verified','featured','community_pick'
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. Analytics event table (lightweight event stream)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'view_vendor','add_to_cart','checkout_start','order_complete'
  user_id uuid NULL,
  vendor_id uuid NULL,
  product_id uuid NULL,
  market_day_id uuid NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_analytics_event_type_time ON analytics_events (event_type, created_at);

-- 7. Market days: add stall_map JSONB for coordinates/svg
ALTER TABLE market_days
  ADD COLUMN IF NOT EXISTS stall_map jsonb DEFAULT '{}'::jsonb, -- svg coords, layout metadata
  ADD COLUMN IF NOT EXISTS capacity int DEFAULT NULL;

-- 8. Orders: add hold_token and payment fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS hold_token uuid, -- reference to inventory holds group (optional)
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','pending','paid','refunded')),
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS coupon_code text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 9. Payments table (optional, simple ledger)
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  provider text,
  provider_charge_id text,
  status text CHECK (status IN ('initiated','succeeded','failed','refunded')) DEFAULT 'initiated',
  created_at timestamptz DEFAULT now()
);

-- 10. Add full-text search vectors for products & vendors
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigger update search_vector
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME = 'products' THEN
    NEW.search_vector :=
      to_tsvector('english', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,'') || ' ' || array_to_string(coalesce(NEW.tags, '{}'), ' '));
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'vendors' THEN
    NEW.search_vector :=
      to_tsvector('english', coalesce(NEW.name,'') || ' ' || coalesce(NEW.bio,'') || ' ' || coalesce(NEW.short_tagline,''));
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_search_vector ON products;
CREATE TRIGGER trg_products_search_vector BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

DROP TRIGGER IF EXISTS trg_vendors_search_vector ON vendors;
CREATE TRIGGER trg_vendors_search_vector BEFORE INSERT OR UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- 11. Useful indexes
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_vendors_search_vector ON vendors USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_vendor_available ON products (vendor_id, is_available);
CREATE INDEX IF NOT EXISTS idx_market_stalls_day_stall ON market_stalls (market_day_id, stall_number);

-- 12. Materialized views for enhanced figures (sales per vendor, top products)
DROP MATERIALIZED VIEW IF EXISTS mv_sales_by_vendor;
CREATE MATERIALIZED VIEW mv_sales_by_vendor AS
SELECT
  v.id as vendor_id,
  v.name as vendor_name,
  COUNT(o.id) AS orders_count,
  COALESCE(SUM(oi.unit_price * oi.quantity),0) AS total_sales,
  MAX(o.created_at) AS last_order_at
FROM vendors v
LEFT JOIN products p ON p.vendor_id = v.id
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id
GROUP BY v.id, v.name;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_sales_by_vendor_vendor_id ON mv_sales_by_vendor (vendor_id);

DROP MATERIALIZED VIEW IF EXISTS mv_top_products;
CREATE MATERIALIZED VIEW mv_top_products AS
SELECT
  p.id as product_id,
  p.name,
  p.vendor_id,
  SUM(oi.quantity) AS units_sold,
  SUM(oi.quantity * oi.unit_price) AS revenue
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.vendor_id
ORDER BY units_sold DESC
LIMIT 100;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_top_products_product_id ON mv_top_products (product_id);

-- 13. Function to refresh materialized views (call nightly)
-- Note: Requires unique indexes on materialized views for CONCURRENT refresh
CREATE OR REPLACE FUNCTION refresh_analytics_views() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Refresh concurrently (non-blocking, requires unique index)
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_by_vendor;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_top_products;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to non-concurrent refresh if concurrent fails
    REFRESH MATERIALIZED VIEW mv_sales_by_vendor;
    REFRESH MATERIALIZED VIEW mv_top_products;
END;
$$;

-- 14. RLS Policies for new tables
ALTER TABLE vendor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your auth setup)
DROP POLICY IF EXISTS vendor_badges_public_read ON vendor_badges;
CREATE POLICY vendor_badges_public_read ON vendor_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS analytics_events_insert ON analytics_events;
CREATE POLICY analytics_events_insert ON analytics_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS product_media_public_read ON product_media;
CREATE POLICY product_media_public_read ON product_media
  FOR SELECT USING (true);

-- Note: For production, add more restrictive policies based on your auth.users setup

