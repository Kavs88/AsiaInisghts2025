-- =============================================================================
-- Staging minimal seed — 8 properties + 15 events
-- Safe for a clean (reset) database. Run once.
-- owner_id NULL = admin-curated (allowed by migration 032).
-- events.host_id has no FK constraint — UUID placeholder is safe.
-- =============================================================================

BEGIN;

-- =============================================================================
-- PROPERTIES
-- Fixed UUIDs so events can reference them in the same script.
--
-- retail      → type = 'commercial'  | property_type = 'rental'
-- event_space → type = 'other'       | property_type = 'event_space'
-- hospitality → type = 'villa'       | property_type = 'rental'
-- =============================================================================

INSERT INTO public.properties (
    id, owner_id,
    address, type, property_type, availability,
    price, bedrooms, bathrooms, square_meters,
    capacity, hourly_rate, daily_rate,
    description, images, contact_phone, contact_email,
    is_active, is_archived
) VALUES

-- RETAIL (3)
(
    'b1000001-0000-0000-0000-000000000001', NULL,
    '12 Han River Promenade, Hai Chau District, Da Nang',
    'commercial', 'rental', 'available',
    1200.00, NULL, NULL, 145.00,
    NULL, NULL, NULL,
    'Ground-floor retail unit facing the river walk. High foot traffic, floor-to-ceiling glass frontage. Suit cafe, lifestyle brand or wellness studio.',
    ARRAY['https://placehold.co/800x600?text=Riverwalk+Retail'],
    '+84 905 111 001', 'leasing@hanriver-commercial.vn',
    TRUE, FALSE
),
(
    'b1000001-0000-0000-0000-000000000002', NULL,
    '7 Tran Phu Street, Hoi An Old Town, Quang Nam',
    'commercial', 'rental', 'available',
    950.00, NULL, NULL, 88.00,
    NULL, NULL, NULL,
    'Heritage shophouse on the main Old Town strip. Exposed timber ceiling, original tile floor. Tourist footfall year-round. Ideal for artisan retail or gallery.',
    ARRAY['https://placehold.co/800x600?text=Old+Town+Shophouse'],
    '+84 905 111 002', 'info@hoian-heritage-leasing.vn',
    TRUE, FALSE
),
(
    'b1000001-0000-0000-0000-000000000003', NULL,
    '33 An Thuong 4 Street, My An Ward, Da Nang',
    'commercial', 'rental', 'rented',
    780.00, NULL, NULL, 112.00,
    NULL, NULL, NULL,
    'Corner unit in the An Thuong expat district. Previously operated as a bistro — kitchen fit-out included. Strong lunch and evening trade.',
    ARRAY['https://placehold.co/800x600?text=An+Thuong+Corner'],
    '+84 905 111 003', 'rentals@anthuong-property.vn',
    TRUE, FALSE
),

-- EVENT SPACES (3)
(
    'b1000001-0000-0000-0000-000000000004', NULL,
    'Rooftop Level, 88 Bach Dang Street, Hai Chau, Da Nang',
    'other', 'event_space', 'available',
    2400.00, NULL, NULL, 320.00,
    250, 180.00, 1100.00,
    'Open-air rooftop terrace with panoramic river views. Fully weatherproofed pergola, built-in bar, AV stack. Capacity 250 standing / 120 seated. Ideal for markets, launch events and sundowners.',
    ARRAY['https://placehold.co/800x600?text=Rooftop+Terrace'],
    '+84 905 222 004', 'events@bachdan-rooftop.vn',
    TRUE, FALSE
),
(
    'b1000001-0000-0000-0000-000000000005', NULL,
    'Ground Floor, Indochine Cultural Centre, 5 Dong Da, Da Nang',
    'other', 'event_space', 'available',
    3200.00, NULL, NULL, 580.00,
    500, 220.00, 1800.00,
    'Column-free event hall with 5 m ceilings, stage, full AV, green room and built-in catering prep. Hosts conferences, galas, curated markets and pop-up exhibitions up to 500 guests.',
    ARRAY['https://placehold.co/800x600?text=Indochine+Hall'],
    '+84 905 222 005', 'bookings@indochine-centre.vn',
    TRUE, FALSE
),
(
    'b1000001-0000-0000-0000-000000000006', NULL,
    'Cam Nam Island Garden, Hoi An, Quang Nam',
    'other', 'event_space', 'available',
    1600.00, NULL, NULL, 2200.00,
    400, 130.00, 900.00,
    'Riverside garden venue across from the Old Town. Tropical landscaping, bamboo pavilions, outdoor kitchen. Perfect for open-air markets, weddings and cultural festivals. Power and water on-site.',
    ARRAY['https://placehold.co/800x600?text=Cam+Nam+Garden'],
    '+84 905 222 006', 'hello@camnam-garden.vn',
    TRUE, FALSE
),

-- HOSPITALITY (2)
(
    'b1000001-0000-0000-0000-000000000007', NULL,
    'Villa Lotus, 14 Lac Long Quan, My Khe Beach, Da Nang',
    'villa', 'rental', 'available',
    3800.00, 4, 4.0, 380.00,
    NULL, NULL, NULL,
    'Architect-designed beachside villa. Private pool, outdoor dining pavilion, chef''s kitchen. 4 en-suite bedrooms. 200 m to My Khe beach. Suited to families, corporate retreats or monthly professional stays.',
    ARRAY['https://placehold.co/800x600?text=Villa+Lotus'],
    '+84 905 333 007', 'stay@villalotus-danang.vn',
    TRUE, FALSE
),
(
    'b1000001-0000-0000-0000-000000000008', NULL,
    'The Indigo House, 22 Nguyen Thi Minh Khai, Hoi An',
    'villa', 'rental', 'available',
    2600.00, 6, 5.0, 420.00,
    NULL, NULL, NULL,
    'Boutique guesthouse in a converted 1930s merchant villa. Six individually styled rooms, courtyard pool, rooftop breakfast terrace. Walking distance to Old Town. Monthly and long-stay rates available.',
    ARRAY['https://placehold.co/800x600?text=The+Indigo+House'],
    '+84 905 333 008', 'reservations@indigohouse-hoian.vn',
    TRUE, FALSE
);


-- =============================================================================
-- EVENTS (15)
-- 3 × market  → venue_type = 'property', property_id = event_space IDs
-- 12 × other  → mix of event / workshop / meetup / popup / fair
--               linked to properties where relevant, custom venue otherwise
-- start_at spread across next 90 days from script execution date
-- status alternates draft / published
-- =============================================================================

INSERT INTO public.events (
    id, title, description,
    start_at, end_at,
    host_type, host_id,
    venue_type, venue_name, venue_address_json,
    property_id,
    status, event_type,
    created_at, updated_at
) VALUES

-- ── MARKET EVENTS (3) ────────────────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000001',
    'Sunday Morning Market — Rooftop Edition',
    'Weekly curated market on the Bach Dang rooftop terrace. 30+ vendors: local ceramics, organic produce, street food, and live acoustic sets. Free entry. 8 AM – 2 PM.',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '6 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Rooftop Terrace — 88 Bach Dang',
    '{"name": "Rooftop Terrace", "street": "88 Bach Dang Street", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000004',
    'published', 'market',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000002',
    'Indochine Makers Market',
    'Monthly makers market inside the Indochine Cultural Centre. Handcrafted goods, artisan food producers, and independent designers. 500-person capacity — space to browse in comfort.',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '21 days' + INTERVAL '6 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Indochine Cultural Centre',
    '{"name": "Indochine Cultural Centre", "street": "5 Dong Da", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000005',
    'published', 'market',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000003',
    'Hoi An Garden Market',
    'Open-air market on Cam Nam Island. River breezes, bamboo pavilions, local farm produce, and live traditional music. Family friendly. 8 AM – 1 PM.',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '35 days' + INTERVAL '5 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Cam Nam Island Garden',
    '{"name": "Cam Nam Island Garden", "street": "Cam Nam Island", "city": "Hoi An", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000006',
    'draft', 'market',
    NOW(), NOW()
),

-- ── EVENT (community / cultural) ─────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000004',
    'Lantern Night — Hoi An Community Evening',
    'Guided lantern-making workshop followed by a riverside lantern release. Celebrates the full moon calendar. Open to all ages. Limited to 80 participants.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '3 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Cam Nam Island Garden',
    '{"name": "Cam Nam Island Garden", "street": "Cam Nam Island", "city": "Hoi An", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000006',
    'published', 'event',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000005',
    'An Thuong Street Food Festival',
    'Two-day street food takeover of the An Thuong neighbourhood. 25 local vendors, craft beer garden, live DJ sets from 6 PM.',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '29 days' + INTERVAL '4 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'custom', 'An Thuong 4 Street, My An Ward',
    '{"name": "An Thuong 4 Street", "city": "Da Nang", "country": "Vietnam"}',
    NULL,
    'published', 'event',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000006',
    'Riverside Cultural Night — Bach Dang',
    'Evening celebration of Vietnamese contemporary arts. Rooftop setting with spoken word, photography exhibition, and traditional ca trù performance. 6 PM – 10 PM.',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '45 days' + INTERVAL '4 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Rooftop Terrace — 88 Bach Dang',
    '{"name": "Rooftop Terrace", "street": "88 Bach Dang Street", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000004',
    'draft', 'event',
    NOW(), NOW()
),

-- ── WORKSHOP ─────────────────────────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000007',
    'Natural Indigo Dyeing Workshop',
    'Full-day natural dyeing workshop led by local artisan Nguyen Thi Lan. Learn resist-dyeing, shibori folds, and colour theory. All materials provided. Max 12 participants.',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '7 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'The Indigo House — Hoi An',
    '{"name": "The Indigo House", "street": "22 Nguyen Thi Minh Khai", "city": "Hoi An", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000008',
    'published', 'workshop',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000008',
    'Vietnamese Street Food Masterclass',
    'Half-day cooking class focused on Central Vietnamese cuisine: mi quang, banh xeo, and cao lau. Held in the Indochine Centre prep kitchen. Small group of 10 max.',
    NOW() + INTERVAL '18 days',
    NOW() + INTERVAL '18 days' + INTERVAL '4 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Indochine Cultural Centre',
    '{"name": "Indochine Cultural Centre", "street": "5 Dong Da", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000005',
    'published', 'workshop',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000009',
    'Ceramics for Beginners — Weekend Session',
    'Saturday morning wheel-throwing class for adults. No experience needed. Includes glazing and optional kiln-firing service. Held poolside at Villa Lotus.',
    NOW() + INTERVAL '40 days',
    NOW() + INTERVAL '40 days' + INTERVAL '3 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Villa Lotus — My Khe',
    '{"name": "Villa Lotus", "street": "14 Lac Long Quan", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000007',
    'draft', 'workshop',
    NOW(), NOW()
),

-- ── MEETUP ───────────────────────────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000010',
    'Vendor & Maker Breakfast Meetup',
    'Informal monthly breakfast for market vendors, independent makers, and creative business owners. Share updates, swap contacts, find collaborators. Hosted at the Han River retail unit.',
    NOW() + INTERVAL '12 days',
    NOW() + INTERVAL '12 days' + INTERVAL '2 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', '12 Han River Promenade',
    '{"name": "Han River Promenade Retail", "street": "12 Han River Promenade", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000001',
    'published', 'meetup',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000011',
    'Platform Partner Roundtable — Q2',
    'Quarterly catchup for Asia Insights platform partners and venue hosts. Agenda: seasonal event calendar, new features, Q&A. Held at Indochine Centre boardroom.',
    NOW() + INTERVAL '60 days',
    NOW() + INTERVAL '60 days' + INTERVAL '2 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Indochine Cultural Centre',
    '{"name": "Indochine Cultural Centre Boardroom", "street": "5 Dong Da", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000005',
    'draft', 'meetup',
    NOW(), NOW()
),

-- ── POPUP ────────────────────────────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000012',
    'Slow Fashion Pop-Up — Hoi An Shophouse',
    'Weekend pop-up showcasing slow and sustainable fashion labels from Vietnam and Southeast Asia. Upcycled garments, natural-fibre pieces, accessories. Saturday & Sunday only.',
    NOW() + INTERVAL '22 days',
    NOW() + INTERVAL '23 days' + INTERVAL '8 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', '7 Tran Phu Street — Hoi An',
    '{"name": "Heritage Shophouse", "street": "7 Tran Phu Street", "city": "Hoi An", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000002',
    'published', 'popup',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000013',
    'Local Ceramics Flash Pop-Up',
    'One-day pop-up from Da Nang pottery collective. Functional stoneware, sculptural pieces, and seconds at studio prices. Cash and transfer accepted. 9 AM – 5 PM.',
    NOW() + INTERVAL '50 days',
    NOW() + INTERVAL '50 days' + INTERVAL '8 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Rooftop Terrace — 88 Bach Dang',
    '{"name": "Rooftop Terrace", "street": "88 Bach Dang Street", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000004',
    'draft', 'popup',
    NOW(), NOW()
),

-- ── FAIR ─────────────────────────────────────────────────────────────────────

(
    'e2000001-0000-0000-0000-000000000014',
    'Central Vietnam Heritage Craft Fair',
    'Three-day celebration of traditional crafts from Quang Nam and Da Nang provinces. Woodcarving, silk weaving, lacquerware, and folk painting. Free entry. Family friendly.',
    NOW() + INTERVAL '70 days',
    NOW() + INTERVAL '72 days' + INTERVAL '6 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Indochine Cultural Centre',
    '{"name": "Indochine Cultural Centre", "street": "5 Dong Da", "city": "Da Nang", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000005',
    'published', 'fair',
    NOW(), NOW()
),
(
    'e2000001-0000-0000-0000-000000000015',
    'Organic & Local Food Fair — Garden Edition',
    'Weekend fair spotlighting organic smallholders, fermented food producers, and zero-waste brands from Central Vietnam. Cooking demos, tasting flights, and kids'' growing workshops. Cam Nam Garden setting.',
    NOW() + INTERVAL '85 days',
    NOW() + INTERVAL '86 days' + INTERVAL '6 hours',
    'user', 'f0000000-0000-0000-0000-000000000001',
    'property', 'Cam Nam Island Garden',
    '{"name": "Cam Nam Island Garden", "street": "Cam Nam Island", "city": "Hoi An", "country": "Vietnam"}',
    'b1000001-0000-0000-0000-000000000006',
    'published', 'fair',
    NOW(), NOW()
);

COMMIT;
