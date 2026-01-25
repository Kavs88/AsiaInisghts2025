-- Verification Queries for Seed Data
-- Run these after seed_data.sql to verify data was inserted correctly

-- 1. Check vendor tiers
SELECT id, name, monthly_price, features 
FROM vendor_tiers 
ORDER BY id;

-- 2. Check vendors
SELECT 
  id, 
  name, 
  slug, 
  tier_id,
  (SELECT name FROM vendor_tiers WHERE id = vendors.tier_id) as tier_name,
  verified,
  is_active
FROM vendors 
ORDER BY name;

-- 3. Check products
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.stock_quantity,
  v.name as vendor_name
FROM products p
JOIN vendors v ON v.id = p.vendor_id
ORDER BY v.name, p.name;

-- 4. Check product media
SELECT 
  pm.id,
  pm.url,
  pm.alt_text,
  p.name as product_name
FROM product_media pm
JOIN products p ON p.id = pm.product_id
ORDER BY p.name;

-- 5. Check market days
SELECT 
  id,
  market_date,
  location_name,
  location_address,
  is_published,
  capacity
FROM market_days
ORDER BY market_date;

-- 6. Check market stalls
SELECT 
  ms.id,
  ms.stall_number,
  v.name as vendor_name,
  md.market_date
FROM market_stalls ms
JOIN vendors v ON v.id = ms.vendor_id
JOIN market_days md ON md.id = ms.market_day_id
ORDER BY md.market_date, ms.stall_number;

-- 7. Check vendor badges
SELECT 
  vb.id,
  vb.badge_type,
  v.name as vendor_name
FROM vendor_badges vb
JOIN vendors v ON v.id = vb.vendor_id
ORDER BY v.name;

-- 8. Check analytics events
SELECT 
  event_type,
  COUNT(*) as count
FROM analytics_events
GROUP BY event_type;

-- 9. Summary counts
SELECT 
  'Vendor Tiers' as table_name,
  COUNT(*) as count
FROM vendor_tiers
UNION ALL
SELECT 
  'Vendors' as table_name,
  COUNT(*) as count
FROM vendors
UNION ALL
SELECT 
  'Products' as table_name,
  COUNT(*) as count
FROM products
UNION ALL
SELECT 
  'Product Media' as table_name,
  COUNT(*) as count
FROM product_media
UNION ALL
SELECT 
  'Market Days' as table_name,
  COUNT(*) as count
FROM market_days
UNION ALL
SELECT 
  'Market Stalls' as table_name,
  COUNT(*) as count
FROM market_stalls
UNION ALL
SELECT 
  'Vendor Badges' as table_name,
  COUNT(*) as count
FROM vendor_badges
UNION ALL
SELECT 
  'Analytics Events' as table_name,
  COUNT(*) as count
FROM analytics_events
ORDER BY table_name;


