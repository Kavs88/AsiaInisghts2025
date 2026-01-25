-- Migration: 008_seed_properties_events_businesses.sql
-- Description: Deterministic seed data for Properties, Events, and Business Directory
-- Created: 2025-01-29
-- Dependencies: 006_properties_events_businesses_schema.sql, 007_properties_events_businesses_rls.sql
-- Note: This requires user accounts to exist. Link to existing users or create test users first.

-- ============================================
-- SAMPLE PROPERTIES (with deterministic UUIDs)
-- ============================================

-- Property 1: Apartment
INSERT INTO public.properties (
    id,
    owner_id,
    address,
    type,
    availability,
    price,
    bedrooms,
    bathrooms,
    square_meters,
    description,
    is_active,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1), -- Use first admin as owner
    '123 Main Street, City Center',
    'apartment',
    'available',
    150000.00,
    2,
    1.5,
    75.00,
    'Beautiful 2-bedroom apartment in the heart of the city. Modern amenities and great location.',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    availability = EXCLUDED.availability;

-- Property 2: House
INSERT INTO public.properties (
    id,
    owner_id,
    address,
    type,
    availability,
    price,
    bedrooms,
    bathrooms,
    square_meters,
    description,
    is_active,
    created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    '456 Oak Avenue, Suburbia',
    'house',
    'available',
    350000.00,
    4,
    2.5,
    180.00,
    'Spacious family home with large garden. Perfect for families looking for space and comfort.',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    availability = EXCLUDED.availability;

-- Property 3: Villa
INSERT INTO public.properties (
    id,
    owner_id,
    address,
    type,
    availability,
    price,
    bedrooms,
    bathrooms,
    square_meters,
    description,
    is_active,
    created_at
) VALUES (
    '33333333-3333-3333-3333-333333333333'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    '789 Beach Road, Coastal Area',
    'villa',
    'available',
    750000.00,
    5,
    4.0,
    300.00,
    'Luxury beachfront villa with stunning ocean views. Private pool and modern design.',
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    availability = EXCLUDED.availability;

-- ============================================
-- SAMPLE EVENTS (with deterministic UUIDs)
-- ============================================

-- Event 1: Upcoming event
INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    ticket_price,
    max_attendees,
    category,
    is_published,
    is_active,
    created_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Community Market Day',
    'Join us for a day of local vendors, food, and entertainment. Family-friendly event.',
    CURRENT_DATE + INTERVAL '14 days',
    '10:00:00',
    '16:00:00',
    'Central Park, Main Square',
    0.00,
    500,
    'Community',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    event_date = EXCLUDED.event_date,
    location = EXCLUDED.location;

-- Event 2: Workshop
INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    ticket_price,
    max_attendees,
    category,
    is_published,
    is_active,
    created_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Artisan Workshop: Pottery Making',
    'Learn the basics of pottery making from local artisans. All materials included.',
    CURRENT_DATE + INTERVAL '21 days',
    '14:00:00',
    '17:00:00',
    'Arts & Crafts Center, Room 3',
    50.00,
    20,
    'Workshop',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    event_date = EXCLUDED.event_date,
    location = EXCLUDED.location;

-- Event 3: Concert
INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    event_date,
    start_time,
    end_time,
    location,
    ticket_price,
    max_attendees,
    category,
    is_published,
    is_active,
    created_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Local Music Festival',
    'An evening of live music featuring local bands. Food and drinks available.',
    CURRENT_DATE + INTERVAL '30 days',
    '18:00:00',
    '23:00:00',
    'Outdoor Amphitheater',
    25.00,
    200,
    'Music',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    event_date = EXCLUDED.event_date,
    location = EXCLUDED.location;

-- ============================================
-- SAMPLE BUSINESSES (with deterministic UUIDs)
-- ============================================

-- Business 1: Restaurant
INSERT INTO public.businesses (
    id,
    owner_id,
    name,
    slug,
    category,
    description,
    contact_phone,
    contact_email,
    address,
    website_url,
    is_verified,
    is_active,
    created_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'The Local Bistro',
    'the-local-bistro',
    'Restaurant',
    'Farm-to-table restaurant serving fresh, locally sourced ingredients. Cozy atmosphere and excellent service.',
    '+1234567890',
    'info@localbistro.com',
    '123 Food Street, Downtown',
    'https://localbistro.com',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category;

-- Business 2: Coffee Shop
INSERT INTO public.businesses (
    id,
    owner_id,
    name,
    slug,
    category,
    description,
    contact_phone,
    contact_email,
    address,
    is_verified,
    is_active,
    created_at
) VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Artisan Coffee Co.',
    'artisan-coffee-co',
    'Cafe',
    'Specialty coffee shop serving single-origin beans and handcrafted beverages. Cozy workspace-friendly environment.',
    '+1234567891',
    'hello@artisancoffee.com',
    '456 Brew Street, Arts District',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category;

-- Business 3: Retail Store
INSERT INTO public.businesses (
    id,
    owner_id,
    name,
    slug,
    category,
    description,
    contact_phone,
    address,
    is_verified,
    is_active,
    created_at
) VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Handmade Treasures',
    'handmade-treasures',
    'Retail',
    'Curated selection of handmade goods from local artisans. Unique gifts and home decor.',
    '+1234567892',
    '789 Craft Avenue, Shopping District',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category;






