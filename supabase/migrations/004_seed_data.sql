-- Migration: 004_seed_data.sql
-- Description: Deterministic seed data for local development
-- Created: 2025-01-29
-- Dependencies: 001_initial_schema.sql, 002_functions.sql, 003_rls_policies.sql
-- Note: This is for development only. Use deterministic IDs for reproducible testing.

-- ============================================
-- DETERMINISTIC SEED DATA
-- ============================================

-- Clear existing seed data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE public.vendors CASCADE;
-- TRUNCATE TABLE public.products CASCADE;
-- TRUNCATE TABLE public.market_days CASCADE;

-- ============================================
-- SAMPLE VENDORS (with deterministic UUIDs)
-- ============================================

-- Note: These vendors require user accounts to be created first
-- In a real scenario, you would create auth users, then create vendor records

-- Sample Vendor 1: Artisan Bakery
INSERT INTO public.vendors (
    id,
    name,
    slug,
    tagline,
    bio,
    category,
    is_active,
    is_verified,
    delivery_available,
    pickup_available,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Artisan Bakery',
    'artisan-bakery',
    'Fresh baked goods daily',
    'We specialize in handcrafted breads, pastries, and cakes made with organic ingredients.',
    'Food & Beverages',
    true,
    true,
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    bio = EXCLUDED.bio,
    category = EXCLUDED.category;

-- Sample Vendor 2: Handmade Ceramics
INSERT INTO public.vendors (
    id,
    name,
    slug,
    tagline,
    bio,
    category,
    is_active,
    is_verified,
    delivery_available,
    pickup_available,
    created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Handmade Ceramics',
    'handmade-ceramics',
    'Unique pottery for your home',
    'Beautiful hand-thrown ceramics made by local artisans. Each piece is unique.',
    'Arts & Crafts',
    true,
    true,
    false,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    bio = EXCLUDED.bio,
    category = EXCLUDED.category;

-- Sample Vendor 3: Organic Produce
INSERT INTO public.vendors (
    id,
    name,
    slug,
    tagline,
    bio,
    category,
    is_active,
    is_verified,
    delivery_available,
    pickup_available,
    created_at
) VALUES (
    '33333333-3333-3333-3333-333333333333'::UUID,
    'Organic Produce',
    'organic-produce',
    'Farm-fresh organic vegetables',
    'Locally grown organic vegetables and fruits, delivered fresh from our farm.',
    'Food & Beverages',
    true,
    true,
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    bio = EXCLUDED.bio,
    category = EXCLUDED.category;

-- ============================================
-- SAMPLE PRODUCTS (with deterministic UUIDs)
-- ============================================

-- Products for Artisan Bakery
INSERT INTO public.products (
    id,
    vendor_id,
    name,
    slug,
    description,
    price,
    stock_quantity,
    is_available,
    requires_preorder,
    category,
    created_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Sourdough Bread',
    'sourdough-bread',
    'Traditional sourdough bread with a crispy crust and tangy flavor.',
    8.50,
    20,
    true,
    false,
    'Bakery',
    NOW()
) ON CONFLICT (vendor_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
    id,
    vendor_id,
    name,
    slug,
    description,
    price,
    stock_quantity,
    is_available,
    requires_preorder,
    category,
    created_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Chocolate Croissant',
    'chocolate-croissant',
    'Buttery croissant filled with rich dark chocolate.',
    4.50,
    15,
    true,
    false,
    'Pastries',
    NOW()
) ON CONFLICT (vendor_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity;

-- Products for Handmade Ceramics
INSERT INTO public.products (
    id,
    vendor_id,
    name,
    slug,
    description,
    price,
    stock_quantity,
    is_available,
    requires_preorder,
    category,
    created_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'Ceramic Bowl Set',
    'ceramic-bowl-set',
    'Set of 4 hand-thrown ceramic bowls in various sizes.',
    45.00,
    5,
    true,
    false,
    'Home & Garden',
    NOW()
) ON CONFLICT (vendor_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity;

-- Products for Organic Produce
INSERT INTO public.products (
    id,
    vendor_id,
    name,
    slug,
    description,
    price,
    stock_quantity,
    is_available,
    requires_preorder,
    category,
    created_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID,
    'Organic Tomato Bundle',
    'organic-tomato-bundle',
    'Bundle of 5 lbs of fresh organic tomatoes.',
    12.00,
    10,
    true,
    false,
    'Produce',
    NOW()
) ON CONFLICT (vendor_id, slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity;

-- ============================================
-- SAMPLE MARKET DAYS (with deterministic UUIDs)
-- ============================================

-- Upcoming market day
INSERT INTO public.market_days (
    id,
    market_date,
    location_name,
    location_address,
    start_time,
    end_time,
    is_published,
    created_at
) VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    CURRENT_DATE + INTERVAL '7 days',
    'Central Market Square',
    '123 Main Street, City Center',
    '09:00:00',
    '15:00:00',
    true,
    NOW()
) ON CONFLICT (market_date) DO UPDATE SET
    location_name = EXCLUDED.location_name,
    location_address = EXCLUDED.location_address,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    is_published = EXCLUDED.is_published;

-- ============================================
-- SAMPLE MARKET STALLS
-- ============================================

-- Assign vendors to stalls
INSERT INTO public.market_stalls (
    id,
    market_day_id,
    vendor_id,
    stall_number,
    attending_physically,
    created_at
) VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    'A1',
    true,
    NOW()
) ON CONFLICT (market_day_id, vendor_id) DO UPDATE SET
    stall_number = EXCLUDED.stall_number,
    attending_physically = EXCLUDED.attending_physically;

INSERT INTO public.market_stalls (
    id,
    market_day_id,
    vendor_id,
    stall_number,
    attending_physically,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    '22222222-2222-2222-2222-222222222222'::UUID,
    'A2',
    true,
    NOW()
) ON CONFLICT (market_day_id, vendor_id) DO UPDATE SET
    stall_number = EXCLUDED.stall_number,
    attending_physically = EXCLUDED.attending_physically;

INSERT INTO public.market_stalls (
    id,
    market_day_id,
    vendor_id,
    stall_number,
    attending_physically,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    '33333333-3333-3333-3333-333333333333'::UUID,
    'B1',
    true,
    NOW()
) ON CONFLICT (market_day_id, vendor_id) DO UPDATE SET
    stall_number = EXCLUDED.stall_number,
    attending_physically = EXCLUDED.attending_physically;






