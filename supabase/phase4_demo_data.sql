-- Phase 4 Demo Data (Events & Deals) - CORRECTED SCHEMA
-- Run this in Supabase SQL Editor.

-- 1. Variables for Vendor IDs (using subqueries)
WITH luna AS (SELECT id FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1),
     green AS (SELECT id FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1),
     soap AS (SELECT id FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1),
     farm AS (SELECT id FROM vendors WHERE name = 'Farm Fresh Produce' LIMIT 1)

-- 2. Insert Events (Using host_id and host_type, no category/image_url/location)
INSERT INTO events (id, host_id, host_type, title, description, start_at, end_at, status, venue_type, venue_address_json)
SELECT 
  gen_random_uuid(),
  luna.id,
  'vendor', 
  'Pottery Wheel Workshop',
  'Learn the basics of throwing on the wheel. A 2-hour introductory class.',
  (now() + INTERVAL '3 days' + INTERVAL '10 hours'),
  (now() + INTERVAL '3 days' + INTERVAL '12 hours'),
  'published',
  'custom',
  '{"name": "Luna Studio, Downtown", "address": "123 Art St"}'::jsonb
FROM luna
UNION ALL
SELECT 
  gen_random_uuid(),
  green.id,
  'vendor',
  'Sourdough Starter Class',
  'Master the art of sourdough maintenance.',
  (now() + INTERVAL '5 days' + INTERVAL '14 hours'),
  (now() + INTERVAL '5 days' + INTERVAL '16 hours'),
  'published',
  'custom',
  '{"name": "Greenway Bakery Kitchen", "address": "456 Baker Ln"}'::jsonb
FROM green
UNION ALL
SELECT 
  gen_random_uuid(),
  soap.id,
  'vendor',
  'Natural Soap Making Demo',
  'Watch how we make our lavender soap.',
  (now() + INTERVAL '7 days' + INTERVAL '11 hours'),
  (now() + INTERVAL '7 days' + INTERVAL '12 hours'),
  'published',
  'custom',
  '{"name": "Market Stall #8", "address": "Main Market Plaza"}'::jsonb
FROM soap
UNION ALL
SELECT 
  gen_random_uuid(),
  farm.id,
  'vendor',
  'Seasonal Harvest Tasting',
  'Taste the best of this seasons harvest.',
  (now() + INTERVAL '6 days' + INTERVAL '9 hours'),
  (now() + INTERVAL '6 days' + INTERVAL '13 hours'),
  'published',
  'custom',
  '{"name": "Riverside Park Market", "address": "Zone A"}'::jsonb
FROM farm;

-- 3. Insert Deals (Deals table has vendor_id, so this remains similar)
-- Checking 009: vendor_id, valid_from, valid_to, status. No discount_code column?
-- 009: id, title, description, vendor_id, valid_from, valid_to, status, created_at, updated_at.
-- NO discount_code in 009. Removing it.
WITH luna AS (SELECT id FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1),
     green AS (SELECT id FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1),
     soap AS (SELECT id FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1)
INSERT INTO deals (id, vendor_id, title, description, valid_from, valid_to, status)
SELECT
  gen_random_uuid(),
  luna.id,
  '15% Off Dinner Sets',
  'Buy a complete 4-piece dinner set and get 15% off.',
  now(),
  (now() + INTERVAL '30 days'),
  'active'
FROM luna
UNION ALL
SELECT
  gen_random_uuid(),
  green.id,
  'BOGO Croissants',
  'Buy one croissant, get one 50% off.',
  now(),
  (now() + INTERVAL '14 days'),
  'active'
FROM green
UNION ALL
SELECT
  gen_random_uuid(),
  soap.id,
  'Bundle & Save',
  '3 Soaps for $30 (Regular $39). Mix and match.',
  now(),
  (now() + INTERVAL '60 days'),
  'active'
FROM soap;
