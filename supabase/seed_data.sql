-- Seed Data for Premium Demo Content
-- Run this after migrations.sql to populate sample data
--
-- WARNING: This script contains UPDATE statements without WHERE clauses
-- These are INTENTIONAL for initializing search vectors on all rows
-- Safe to run on empty or newly created database

-- 1. Insert vendor tiers first
INSERT INTO vendor_tiers (name, monthly_price, features)
VALUES
  ('Free', 0.00, '{"featured":false}'),
  ('Premium', 29.00, '{"featured":true, "priority_stall":true}'),
  ('Featured', 99.00, '{"homepage_carousel":true,"slot_priority":true}')
ON CONFLICT DO NOTHING;

-- 2. Create sample vendors with premium features (using tier names to get IDs)
INSERT INTO vendors (id, name, slug, bio, short_tagline, hero_image_url, is_active, tier_id, verified, contact_phone, social_links, seo_title, seo_description, created_at)
SELECT
  gen_random_uuid(),
  'Luna Ceramics',
  'luna-ceramics',
  'Hand-thrown ceramics and kitchenware made with traditional techniques. Each piece is unique and fired in our small-batch kiln.',
  'Handmade ceramics from small-batch kiln',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=600&fit=crop',
  true,
  (SELECT id FROM vendor_tiers WHERE name = 'Premium' LIMIT 1),
  true,
  '+1234567890',
  '{"instagram": "@lunaceramics", "website": "https://lunaceramics.com"}'::jsonb,
  'Luna Ceramics - Handmade pottery',
  'Luna offers handmade ceramic pieces for kitchen and home.',
  now()
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, short_tagline, hero_image_url, is_active, tier_id, verified, contact_phone, social_links, seo_title, seo_description, created_at)
SELECT
  gen_random_uuid(),
  'Greenway Bakery',
  'greenway-bakery',
  'Artisan sourdough & pastries baked fresh daily. We use organic flour and traditional fermentation methods.',
  'Wood-fired sourdough and morning pastries',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=600&fit=crop',
  true,
  (SELECT id FROM vendor_tiers WHERE name = 'Featured' LIMIT 1),
  true,
  '+1234567891',
  '{"instagram": "@greenwaybakery", "website": "https://greenwaybakery.com"}'::jsonb,
  'Greenway Bakery - Sourdough & Pastries',
  'Freshly baked in small batches every morning.',
  now()
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, short_tagline, hero_image_url, is_active, tier_id, verified, contact_phone, social_links, seo_title, seo_description, created_at)
SELECT
  gen_random_uuid(),
  'Artisan Soaps',
  'artisan-soaps',
  'Natural handmade soap collections using organic ingredients and essential oils.',
  'Natural handmade soap collections',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=600&fit=crop',
  true,
  (SELECT id FROM vendor_tiers WHERE name = 'Premium' LIMIT 1),
  true,
  '+1234567892',
  '{"instagram": "@artisansoaps"}'::jsonb,
  'Artisan Soaps - Natural Handmade Soap',
  'Handcrafted soaps made with organic ingredients.',
  now()
ON CONFLICT (slug) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, short_tagline, hero_image_url, is_active, tier_id, verified, contact_phone, social_links, seo_title, seo_description, created_at)
SELECT
  gen_random_uuid(),
  'Farm Fresh Produce',
  'farm-fresh-produce',
  'Locally grown organic vegetables and fruits from our family farm.',
  'Locally grown organic vegetables',
  'https://images.unsplash.com/photo-1546470427-e26264be0b01?w=1200&h=600&fit=crop',
  true,
  (SELECT id FROM vendor_tiers WHERE name = 'Free' LIMIT 1),
  true,
  '+1234567893',
  '{}'::jsonb,
  'Farm Fresh Produce - Organic Vegetables',
  'Fresh organic produce from local farms.',
  now()
ON CONFLICT (slug) DO NOTHING;

-- 3. Sample products for vendors
-- Luna Ceramics products
WITH vendor AS (
  SELECT id FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1
)
INSERT INTO products (id, vendor_id, name, description, price, stock_quantity, is_available, requires_preorder, created_at, slug, categories, tags, seo_title, seo_description)
SELECT
  gen_random_uuid(),
  id,
  'Stoneware Dinner Plate',
  'Durable 10-inch stoneware dinner plate, dishwasher safe. Hand-thrown and glazed with food-safe finish.',
  24.50,
  40,
  true,
  false,
  now(),
  'stoneware-dinner-plate',
  ARRAY['tableware','stoneware'],
  ARRAY['plate','ceramic','dinner'],
  'Stoneware Dinner Plate - Luna Ceramics',
  '10-inch stoneware dinner plate handcrafted by Luna Ceramics'
FROM vendor
UNION ALL
SELECT
  gen_random_uuid(),
  id,
  'Ceramic Coffee Mug Set',
  'Set of 2 hand-thrown ceramic mugs, perfect for your morning coffee. Each mug is unique.',
  32.00,
  25,
  true,
  false,
  now(),
  'ceramic-coffee-mug-set',
  ARRAY['tableware','mugs'],
  ARRAY['mug','coffee','ceramic'],
  'Ceramic Coffee Mug Set - Luna Ceramics',
  'Set of 2 handcrafted ceramic coffee mugs'
FROM vendor
ON CONFLICT (vendor_id, slug) DO NOTHING;

-- Greenway Bakery products
WITH vendor AS (
  SELECT id FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1
)
INSERT INTO products (id, vendor_id, name, description, price, stock_quantity, is_available, requires_preorder, created_at, slug, categories, tags, seo_title, seo_description)
SELECT
  gen_random_uuid(),
  id,
  'Sourdough Loaf - Daily Bake',
  'Classic sourdough loaf, naturally leavened, 750g. Baked fresh daily using traditional methods.',
  6.50,
  120,
  true,
  false,
  now(),
  'sourdough-loaf-daily',
  ARRAY['bakery','bread'],
  ARRAY['sourdough','bread'],
  'Sourdough Loaf - Greenway Bakery',
  'Classic naturally leavened sourdough loaf from Greenway Bakery'
FROM vendor
UNION ALL
SELECT
  gen_random_uuid(),
  id,
  'Butter Croissant',
  'Flaky, buttery croissant made with European butter. Baked fresh every morning.',
  4.50,
  80,
  true,
  false,
  now(),
  'butter-croissant',
  ARRAY['bakery','pastries'],
  ARRAY['croissant','pastry'],
  'Butter Croissant - Greenway Bakery',
  'Flaky buttery croissant baked fresh daily'
FROM vendor
ON CONFLICT (vendor_id, slug) DO NOTHING;

-- Artisan Soaps products
WITH vendor AS (
  SELECT id FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1
)
INSERT INTO products (id, vendor_id, name, description, price, stock_quantity, is_available, requires_preorder, created_at, slug, categories, tags, seo_title, seo_description)
SELECT
  gen_random_uuid(),
  id,
  'Lavender Hand Soap',
  'A luxurious hand soap made with organic lavender essential oil and natural ingredients. Perfect for daily use.',
  12.99,
  50,
  true,
  false,
  now(),
  'lavender-hand-soap',
  ARRAY['wellness','soap'],
  ARRAY['lavender','soap','handmade'],
  'Lavender Hand Soap - Artisan Soaps',
  'Natural lavender hand soap with organic ingredients'
FROM vendor
ON CONFLICT (vendor_id, slug) DO NOTHING;

-- Farm Fresh Produce products
WITH vendor AS (
  SELECT id FROM vendors WHERE name = 'Farm Fresh Produce' LIMIT 1
)
INSERT INTO products (id, vendor_id, name, description, price, stock_quantity, is_available, requires_preorder, created_at, slug, categories, tags, seo_title, seo_description)
SELECT
  gen_random_uuid(),
  id,
  'Organic Tomato Bundle',
  'Fresh organic tomatoes, locally grown. Perfect for salads, sauces, and cooking.',
  8.50,
  30,
  true,
  false,
  now(),
  'organic-tomato-bundle',
  ARRAY['produce','vegetables'],
  ARRAY['tomato','organic','fresh'],
  'Organic Tomato Bundle - Farm Fresh Produce',
  'Fresh organic tomatoes from local farms'
FROM vendor
ON CONFLICT (vendor_id, slug) DO NOTHING;

-- 4. Product media (images)
INSERT INTO product_media (product_id, url, alt_text, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=800&fit=crop', 'Stoneware Dinner Plate - front view', 0 
FROM products p WHERE p.name ILIKE '%Dinner Plate%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_media (product_id, url, alt_text, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=800&fit=crop', 'Sourdough Loaf - sliced view', 0 
FROM products p WHERE p.name ILIKE '%Sourdough%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_media (product_id, url, alt_text, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop', 'Lavender Hand Soap', 0 
FROM products p WHERE p.name ILIKE '%Lavender%' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO product_media (product_id, url, alt_text, sort_order)
SELECT p.id, 'https://images.unsplash.com/photo-1546470427-e26264be0b01?w=800&h=800&fit=crop', 'Organic Tomato Bundle', 0 
FROM products p WHERE p.name ILIKE '%Tomato%' LIMIT 1
ON CONFLICT DO NOTHING;

-- 5. Market days (upcoming markets)
INSERT INTO market_days (id, market_date, location_name, location_address, is_published, capacity, stall_map, created_at)
VALUES
  (gen_random_uuid(), (now() + INTERVAL '6 days')::date, 'Riverside Park', 'Zone A, Downtown', true, 80, '{"layout": "grid", "stalls": 80}'::jsonb, now()),
  (gen_random_uuid(), (now() + INTERVAL '13 days')::date, 'Riverside Park', 'Zone A, Downtown', true, 80, '{"layout": "grid", "stalls": 80}'::jsonb, now())
ON CONFLICT (market_date) DO NOTHING;

-- 6. Assign stalls to vendors
WITH md AS (SELECT id FROM market_days ORDER BY market_date LIMIT 1),
     luna AS (SELECT id FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1),
     green AS (SELECT id FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1),
     soap AS (SELECT id FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1),
     farm AS (SELECT id FROM vendors WHERE name = 'Farm Fresh Produce' LIMIT 1)
INSERT INTO market_stalls (id, market_day_id, vendor_id, stall_number, attending_physically)
SELECT gen_random_uuid(), md.id, luna.id, 12, true FROM md, luna
UNION ALL
SELECT gen_random_uuid(), md.id, green.id, 5, true FROM md, green
UNION ALL
SELECT gen_random_uuid(), md.id, soap.id, 8, true FROM md, soap
UNION ALL
SELECT gen_random_uuid(), md.id, farm.id, 15, true FROM md, farm
ON CONFLICT (market_day_id, vendor_id) DO NOTHING;

-- 7. Vendor badges
INSERT INTO vendor_badges (vendor_id, badge_type, meta)
SELECT id, 'verified', '{"verified_at": "2024-01-15"}'::jsonb FROM vendors WHERE verified = true
ON CONFLICT DO NOTHING;

INSERT INTO vendor_badges (vendor_id, badge_type, meta)
SELECT v.id, 'featured', '{"featured_since": "2024-01-15"}'::jsonb 
FROM vendors v
JOIN vendor_tiers vt ON vt.id = v.tier_id
WHERE vt.name IN ('Premium', 'Featured')
ON CONFLICT DO NOTHING;

-- 8. Sample analytics events
INSERT INTO analytics_events (event_type, vendor_id, product_id, market_day_id, payload)
SELECT 'view_vendor', id, NULL, (SELECT id FROM market_days ORDER BY market_date LIMIT 1), '{"source": "homepage"}'::jsonb 
FROM vendors LIMIT 4;

-- Update search vectors for all products and vendors
-- NOTE: These UPDATE statements intentionally update ALL rows to populate search_vector
-- This is safe for seed data as we're initializing the full-text search index
UPDATE products 
SET search_vector = to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || array_to_string(coalesce(tags, '{}'), ' '))
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

UPDATE vendors 
SET search_vector = to_tsvector('english', coalesce(name,'') || ' ' || coalesce(bio,'') || ' ' || coalesce(short_tagline,''))
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

-- Refresh materialized views (optional - may fail if no order data exists yet)
-- This is safe to skip if you haven't created any orders
DO $$
BEGIN
  PERFORM refresh_analytics_views();
EXCEPTION
  WHEN OTHERS THEN
    -- Silently skip if refresh fails (e.g., no data yet)
    NULL;
END $$;

