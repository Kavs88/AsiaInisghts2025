-- Migration: 008_seed_properties_events_businesses.sql
-- Description: Deterministic seed data for Properties, Events, and Business Directory
-- Note: This requires user accounts to exist. Uses first admin user as owner.

-- ============================================
-- SCHEMA REPAIR (Self-Healing)
-- ============================================

-- Ensure Properties table has required columns
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS property_type TEXT NOT NULL DEFAULT 'rental' CHECK (property_type IN ('rental', 'event_space')),
ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity > 0);

-- Ensure Events table has required columns
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- Ensure Businesses table has required columns
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- ============================================
-- SAMPLE BUSINESSES (Aligned with Homepage)
-- ============================================

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
    logo_url,
    hero_image_url,
    tagline,
    is_verified,
    is_active,
    created_at
) VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Danang Luxury Stays',
    'danang-luxury-stays',
    'service',
    'Premium property management and luxury stays in Da Nang.',
    '+84 123 456 789',
    'info@danangstays.com',
    '123 Vo Nguyen Giap, Da Nang',
    'https://danangstays.com',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    'Premium property management and luxury stays.',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    address = EXCLUDED.address,
    website_url = EXCLUDED.website_url,
    logo_url = EXCLUDED.logo_url,
    hero_image_url = EXCLUDED.hero_image_url,
    tagline = EXCLUDED.tagline;

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
    logo_url,
    hero_image_url,
    tagline,
    is_verified,
    is_active,
    created_at
) VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Hoi An Heritage stays',
    'hoi-an-heritage',
    'service',
    'Authentic heritage stays and cultural experiences in Hoi An.',
    '+84 987 654 321',
    'hello@hoianheritage.com',
    '45 Tran Phu, Hoi An',
    'https://hoianheritage.com',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'Authentic heritage and cultural experiences.',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    address = EXCLUDED.address,
    website_url = EXCLUDED.website_url,
    logo_url = EXCLUDED.logo_url,
    hero_image_url = EXCLUDED.hero_image_url,
    tagline = EXCLUDED.tagline;

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
    logo_url,
    hero_image_url,
    tagline,
    is_verified,
    is_active,
    created_at
) VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Marble Mountains Events',
    'marble-mountains',
    'venue',
    'Premier event spaces and coordination in the Ngu Hanh Son area.',
    '+84 111 222 333',
    'events@marblemountains.com',
    'Hoa Hai, Ngu Hanh Son, Da Nang',
    'https://marblemountains.com',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    'Premier event spaces and coordination.',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    address = EXCLUDED.address,
    website_url = EXCLUDED.website_url,
    logo_url = EXCLUDED.logo_url,
    hero_image_url = EXCLUDED.hero_image_url,
    tagline = EXCLUDED.tagline;

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
    logo_url,
    hero_image_url,
    tagline,
    is_verified,
    is_active,
    created_at
) VALUES (
    '99999999-9999-9999-9999-999999999999'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Dragon Bridge Tech',
    'dragon-bridge',
    'service',
    'Modern urban apartments and smart home services.',
    '+84 444 555 666',
    'hello@dragonbridgetech.com',
    '88 Bach Dang, Da Nang',
    'https://dragonbridgetech.com',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    'Modern urban apartments and smart home services.',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    address = EXCLUDED.address,
    website_url = EXCLUDED.website_url,
    logo_url = EXCLUDED.logo_url,
    hero_image_url = EXCLUDED.hero_image_url,
    tagline = EXCLUDED.tagline;

-- ============================================
-- SAMPLE PROPERTIES (Aligned with Homepage)
-- ============================================

INSERT INTO public.properties (
    id,
    owner_id,
    business_id,
    address,
    type,
    property_type,
    availability,
    price,
    bedrooms,
    bathrooms,
    description,
    images,
    is_active,
    created_at
) VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::UUID,
    'My Khe Beach Villa',
    'villa',
    'rental',
    'available',
    2500.00,
    4,
    4.0,
    'Stunning 4-bedroom villa just steps away from My Khe Beach. Features a private pool and rooftop terrace.',
    ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    property_type = EXCLUDED.property_type;

INSERT INTO public.properties (
    id,
    owner_id,
    business_id,
    address,
    type,
    property_type,
    availability,
    price,
    bedrooms,
    bathrooms,
    description,
    images,
    is_active,
    created_at
) VALUES (
    '22222222-2222-2222-2222-222222222222'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::UUID,
    'Hoi An Riverside Studio',
    'apartment',
    'rental',
    'available',
    800.00,
    1,
    1.0,
    'Charming studio apartment overlooking the Thu Bon River. Perfect for digital nomads.',
    ARRAY['https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'],
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    property_type = EXCLUDED.property_type;

INSERT INTO public.properties (
    id,
    owner_id,
    business_id,
    address,
    type,
    property_type,
    availability,
    capacity,
    description,
    images,
    is_active,
    created_at
) VALUES (
    '33333333-3333-3333-3333-333333333333'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::UUID,
    'The Grand Ballroom',
    'commercial',
    'event_space',
    'available',
    300,
    'Elegant ballroom with state-of-the-art audio-visual equipment. Ideal for weddings and corporate events.',
    ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'],
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    property_type = EXCLUDED.property_type,
    capacity = EXCLUDED.capacity;

INSERT INTO public.properties (
    id,
    owner_id,
    business_id,
    address,
    type,
    property_type,
    availability,
    price,
    bedrooms,
    bathrooms,
    description,
    images,
    is_active,
    created_at
) VALUES (
    '44444444-4444-4444-4444-444444444444'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    '99999999-9999-9999-9999-999999999999'::UUID,
    'Penthouse with City View',
    'condo',
    'rental',
    'available',
    1800.00,
    2,
    2.0,
    'Luxury penthouse with panoramic views of Da Nang city and the Dragon Bridge.',
    ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'],
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    property_type = EXCLUDED.property_type;

-- ============================================
-- SAMPLE EVENTS
-- ============================================

INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    start_at,
    end_at,
    location,
    ticket_price,
    max_attendees,
    category,
    status,
    is_published,
    is_active,
    created_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Community Market Day',
    'Join us for a day of local vendors, food, and entertainment. Family-friendly event.',
    (CURRENT_DATE + INTERVAL '14 days' + TIME '10:00:00')::TIMESTAMPTZ,
    (CURRENT_DATE + INTERVAL '14 days' + TIME '16:00:00')::TIMESTAMPTZ,
    'Central Park, Main Square',
    0.00,
    500,
    'Community',
    'published',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    start_at = EXCLUDED.start_at,
    location = EXCLUDED.location;

INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    start_at,
    end_at,
    location,
    ticket_price,
    max_attendees,
    category,
    status,
    is_published,
    is_active,
    created_at
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Artisan Workshop: Pottery Making',
    'Learn the basics of pottery making from local artisans. All materials included.',
    (CURRENT_DATE + INTERVAL '21 days' + TIME '14:00:00')::TIMESTAMPTZ,
    (CURRENT_DATE + INTERVAL '21 days' + TIME '17:00:00')::TIMESTAMPTZ,
    'Arts & Crafts Center, Room 3',
    50.00,
    20,
    'Workshop',
    'published',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    start_at = EXCLUDED.start_at,
    location = EXCLUDED.location;

INSERT INTO public.events (
    id,
    organizer_id,
    title,
    description,
    start_at,
    end_at,
    location,
    ticket_price,
    max_attendees,
    category,
    status,
    is_published,
    is_active,
    created_at
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::UUID,
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
    'Local Music Festival',
    'An evening of live music featuring local bands. Food and drinks available.',
    (CURRENT_DATE + INTERVAL '30 days' + TIME '18:00:00')::TIMESTAMPTZ,
    (CURRENT_DATE + INTERVAL '30 days' + TIME '23:00:00')::TIMESTAMPTZ,
    'Outdoor Amphitheater',
    25.00,
    200,
    'Music',
    'published',
    true,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    start_at = EXCLUDED.start_at,
    location = EXCLUDED.location;



