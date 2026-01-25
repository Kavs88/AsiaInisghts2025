-- Seed Data Script
-- Run this AFTER 100_repair_schema.sql

-- Clear existing data
TRUNCATE TABLE events, properties, businesses, vendors CASCADE;


INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'ef248005-4ed4-4bf8-9f49-6fcced50dd24',
  'Madam Lan''s Grilled Seafood',
  'madam-lan-seafood',
  'Fresh Son Tra Flavors',
  '',
  '', 
  '', 
  '',
  '',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '69cfd42b-ce94-4fe2-84d2-126c6118f44f',
  'Hoi An Lantern Crafts',
  'hoian-lantern-crafts',
  'Handmade Silk Lanterns',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '9ff13ae9-0cf2-414b-b1ca-f000f83e6e8c',
  'Ba Hanh Banh Xeo',
  'ba-hanh-banh-xeo',
  'Authentic Crispy Pancakes',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  false,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'ff2198bd-6080-4947-a2fa-fe540e3cdae0',
  'Trung Nguyen Legend',
  'trung-nguyen-legend',
  'The Energy Coffee',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '419fbdd6-480a-426d-bb0e-35c5bee68390',
  'Danang Souvenirs',
  'danang-souvenirs',
  'Take a piece of Da Nang home',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '40a2fab8-6174-46ff-b029-e14be153151c',
  'Marble Mountain Stone Crafts',
  'marble-mountain-crafts',
  'Hand-carved stone statues',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '1375340a-af0c-425f-a8df-6a37fd16f911',
  'Mrs. Vy''s Tailor',
  'mrs-vy-tailor',
  'Custom suits in 24 hours',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  false,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'a344e0bd-22d2-49e3-8124-e2020ff7ba92',
  'Banh Mi Phuong',
  'banh-mi-phuong',
  'Best Banh Mi in Vietnam',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'e0cb3dc3-1f06-4820-9297-069fba198384',
  'Reaching Out Arts',
  'reaching-out-arts',
  'Ethical handmade crafts',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'bb07fe5c-3f3c-4a79-abbc-1d4a212da3d5',
  'Yaly Couture',
  'yaly-couture',
  'Premium tailoring experience',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'd5f71845-e950-4ce0-b813-f87d8f9a5ffa',
  'Cocobox Juice Bar',
  'cocobox-juice',
  'Organic cold-pressed juices',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'b68dea89-eb2c-4196-a212-0101e8cd51f5',
  'Hoi An Roastery',
  'hoian-roastery',
  'Traditional roasted coffee',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'efde6ec0-5002-4c43-b31d-409875b18430',
  'Bamboo Arts',
  'bamboo-arts',
  'Sustainable bamboo products',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '7ff908d8-f22c-4e94-a6d0-fdfe14bf1a0a',
  'Kim Bong Carpentry',
  'kim-bong-carpentry',
  'Traditional woodworking',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  false,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '3258a1aa-1d29-4377-b517-d1199fb09487',
  'Thanh Ha Pottery',
  'thanh-ha-pottery',
  'Hand-thrown ceramics',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'f89ff7c5-ee3f-4921-b6a1-b404ab77f841',
  'My Quang 24/7',
  'my-quang-247',
  'Noodles anytime',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'e156f329-2ea3-4ba2-94b3-d4d782b0514e',
  'Che Lien Dessert',
  'che-lien',
  'Sweet soup desserts',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  'bb8d4aa9-56dd-4e74-a254-22731448dceb',
  'Be Man Seafood',
  'be-man-seafood',
  'Ocean fresh everyday',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  false,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '102f8a52-f67f-4d6c-aa84-4c17a8771765',
  'Madame Khanh',
  'madame-khanh',
  'The Banh Mi Queen',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (id, name, slug, bio, logo_url, hero_image_url, contact_email, contact_phone, website_url, user_id, is_active, is_verified, delivery_available, pickup_available)
VALUES (
  '7b1725e3-f38e-4b18-8ffe-54651bcac541',
  'Mot Hoi An',
  'mot-hoian',
  'Herbal tea with a lotus petal',
  '',
  '', 
  '', 
  '',
  '',
  NULL,
  true,
  true,
  false,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '8b714158-8a56-48c3-b32c-df9bb181fe57',
  'The Hideout Cafe',
  'the-hideout-cafe-danang',
  'A tranquil garden cafe popular with digital nomads. Known for its peaceful working environment.',
  'Da Nang, Vietnam',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_the-hideout-cafe-danang_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '210827bb-5eed-4ab8-8e19-8b6a69930f8d',
  '43 Factory Coffee Roaster',
  '43-factory-coffee',
  'Upscale specialty coffee shop with a large industrial space and signature coconut coffee.',
  '422 Ngo Thi Sy, Da Nang',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_43-factory-coffee_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'abb9fa7c-0c55-49b3-9acc-c36c1f686a3a',
  'Naia Yoga + Cafe',
  'naia-yoga-hoian',
  'The first yoga center on the beach in Hoi An. Open studio with views of the East Sea.',
  'An Bang Beach, Hoi An',
  'Health & Wellness',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_naia-yoga-hoian_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'ba8e7f5c-6da1-42d7-adcc-476c083a907b',
  'Nomad Yoga Hoi An',
  'nomad-yoga-hoian',
  'A pioneer in Hoi An''s yoga scene, offering traditional Rishikesh style teaching.',
  '6 Le Hong Phong, Hoi An',
  'Health & Wellness',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_nomad-yoga-hoian_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '1513ed6c-a09a-4c21-8cb9-5ed98425b7dc',
  'Bread N Salt Cafe',
  'bread-n-salt-cafe',
  'Modern cafe with spacious seating, perfect for extended work sessions.',
  'Da Nang, Vietnam',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_bread-n-salt-cafe_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'cbb59488-11ba-4322-8b4b-8886e778dd5a',
  'The Local Beans',
  'the-local-beans',
  'Dedicated coworking space with comfortable desks and reliable Wi-Fi.',
  'Da Nang, Vietnam',
  'Coworking',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_the-local-beans_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'a10cec77-3629-4ed3-b680-fd2882f0b4a0',
  'Wonderlust Bakery & Coffee',
  'wonderlust-bakery',
  'A cool working environment with awesome Italian-style espressos and lattes.',
  '96 Tran Phu, Da Nang',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_wonderlust-bakery_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'a1af318c-26c5-4c7b-ae3b-54f736748bf8',
  'Goblin Coffee',
  'goblin-coffee',
  'Cozy atmosphere with a unique rustic decor, great for evening work.',
  'Da Nang, Vietnam',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_goblin-coffee_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '52d80633-6791-482a-9a91-f671446f5b39',
  'Highlands Coffee Riverside',
  'highlands-coffee-riverside',
  'Iconic Vietnamese chain offering strong coffee and river views.',
  'Bach Dang Street, Da Nang',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_highlands-coffee-riverside_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '1c65eced-7ce5-4998-98a8-853eaa4301da',
  'Cong Caphe Han Market',
  'cong-caphe-han-market',
  'Famous coconut coffee in a communist-chic setting.',
  'Bach Dang, Da Nang',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_cong-caphe-han-market_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '7000035d-3dbc-46bf-8268-af809da80b37',
  'Enouvo Space',
  'enouvo-space',
  'Professional coworking hub for tech teams and creatives.',
  'An Son 3, Da Nang',
  'Coworking',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_enouvo-space_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '0628cce4-dc00-435f-838e-502dd7a04df6',
  'Beans Workspace',
  'beans-workspace',
  'Quiet, productive environment with ergonomic seating.',
  'Thai Phien, Da Nang',
  'Coworking',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_beans-workspace_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'a662772f-894c-4104-86f1-5a55c6416f75',
  'Aum Yoga Vietnam',
  'aum-yoga-vietnam',
  'Holistic Hatha yoga studio focusing on mind and body conditioning.',
  'Hoi An, Vietnam',
  'Health & Wellness',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_aum-yoga-vietnam_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '3dd96ce4-cb4e-4a23-b4bc-968e12586a51',
  'Annen Yoga & Vegetarian',
  'annen-yoga',
  'Yoga studio combining practice with healthy vegetarian dining.',
  'Hoi An, Vietnam',
  'Health & Wellness',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_annen-yoga_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '2f49c113-fef9-4434-8b10-e1b1172a8fcb',
  'Reaching Out Teahouse',
  'reaching-out-teahouse',
  'A silent teahouse employing people with disabilities. Peaceful and beautiful.',
  'Hoi An Ancient Town',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_reaching-out-teahouse_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '342b60d7-95d3-4c76-a45a-7d296ad1da77',
  'Sunday in Hoi An',
  'sunday-in-hoi-an',
  'Curated homewares and interior design ship.',
  'Tran Phu, Hoi An',
  'Retail',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_sunday-in-hoi-an_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '5df6e3f4-21c0-45b5-ad64-633021fe982b',
  'Son Tra Night Market Management',
  'son-tra-market-mgmt',
  'Official management office for the Son Tra Night Market.',
  'Ly Nam De, Da Nang',
  'Community',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_son-tra-market-mgmt_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '24a7e22c-ee7c-431b-953e-1b45b65423b3',
  'Helmsman Market',
  'helmsman-market',
  'Local seafood and produce market near the harbor.',
  'Da Nang, Vietnam',
  'Market',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_helmsman-market_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  '252001df-c384-406b-939a-b8a29aa21f3e',
  'Cham Yoga',
  'cham-yoga',
  'Affordable local yoga studio offering authentic practice.',
  'Hoi An, Vietnam',
  'Health & Wellness',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_cham-yoga_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO businesses (id, name, slug, description, address, category, owner_id, hero_image_url, tagline, is_active, is_verified)
VALUES (
  'e7b7d98a-e7d2-4bd7-a5c5-c0f10bb93720',
  'Mia Coffee',
  'mia-coffee',
  'Inviting relaxing space with a focus on high-quality beans.',
  'Da Nang, Vietnam',
  'Cafe',
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/business_mia-coffee_hero.jpg', 
  '',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '80fee25c-54a1-4609-b8bf-998811df6ae1',
  '123 Lac Long Quan, Hoi An',
  'villa',
  'rental',
  2500000,
  3,
  1,
  NULL,
  'Traditional riverside villa with pool.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_123-lac-long-quan--hoi-an_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '210827bb-5eed-4ab8-8e19-8b6a69930f8d',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '2d654e84-ab82-4fd0-8e51-6b482f4b4dc7',
  'TMS Luxury Hotel, Da Nang',
  'condo',
  'rental',
  1800000,
  2,
  1,
  NULL,
  'Ocean view apartment on My Khe Beach.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_tms-luxury-hotel--da-nang_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '2f49c113-fef9-4434-8b10-e1b1172a8fcb',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '6f4c214d-27eb-41a4-836f-8a50f1e83882',
  'An Bang Beach Village',
  'house',
  'rental',
  1200000,
  2,
  1,
  NULL,
  'Cozy fisherman''s house converted for guests.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_an-bang-beach-village_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '252001df-c384-406b-939a-b8a29aa21f3e',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'f42af9a4-e567-4132-9c95-7f34878044ec',
  'Azura Apartment',
  'apartment',
  'rental',
  2000000,
  2,
  1,
  NULL,
  'Luxury apartment next to Han River Bridge.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_azura-apartment_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '7000035d-3dbc-46bf-8268-af809da80b37',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'c433bfe4-42ea-4b27-8ad5-92dcc386c268',
  'Monarchy Block B',
  'apartment',
  'rental',
  1500000,
  1,
  1,
  NULL,
  'Modern studio with city views.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_monarchy-block-b_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'a10cec77-3629-4ed3-b680-fd2882f0b4a0',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'b592b70e-456d-4805-9e1a-60b0508c8f99',
  'Hoi An Field Villa',
  'villa',
  'rental',
  3000000,
  4,
  1,
  NULL,
  'Surrounded by rice paddies, peaceful retreat.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_hoi-an-field-villa_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '24a7e22c-ee7c-431b-953e-1b45b65423b3',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '78425745-1923-4f38-b84c-48897aed6dab',
  'Ocean Villas Da Nang',
  'villa',
  'rental',
  8000000,
  5,
  1,
  NULL,
  '5-star resort villa with private pool.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_ocean-villas-da-nang_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '5df6e3f4-21c0-45b5-ad64-633021fe982b',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '983c87e2-5929-40aa-a58c-502cec84e195',
  'Hiyori Garden Tower',
  'apartment',
  'rental',
  2200000,
  2,
  1,
  NULL,
  'Japanese standard apartment near Dragon Bridge.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_hiyori-garden-tower_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '3dd96ce4-cb4e-4a23-b4bc-968e12586a51',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '66dd4bb3-40ec-44e6-b617-d0376fe5d53d',
  'Cam Chau Homestay',
  'house',
  'rental',
  800000,
  1,
  1,
  NULL,
  'Live with a local family in Hoi An.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_cam-chau-homestay_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'ba8e7f5c-6da1-42d7-adcc-476c083a907b',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'ab32306a-9533-425f-8380-36053e94ee55',
  'Four Points Sheraton Area',
  'condo',
  'rental',
  3500000,
  3,
  1,
  NULL,
  'High floor condo with panoramic beach views.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_four-points-sheraton-area_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'abb9fa7c-0c55-49b3-9acc-c36c1f686a3a',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'bdd18c4e-4637-479a-a8e4-7d7c42b6fe3f',
  'Tra Que Vegetable Village',
  'house',
  'rental',
  1000000,
  2,
  1,
  NULL,
  'Rustic charm in the herb village.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_tra-que-vegetable-village_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'ba8e7f5c-6da1-42d7-adcc-476c083a907b',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '8ed5ead1-250f-4e46-83a5-e696d672a12a',
  'Indochina Riverside',
  'apartment',
  'rental',
  2800000,
  2,
  1,
  NULL,
  'Central location with shopping mall downstairs.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_indochina-riverside_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'a1af318c-26c5-4c7b-ae3b-54f736748bf8',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '17df8973-4260-431a-a7d4-2db211987e41',
  'Golden Bay Area',
  'condo',
  'rental',
  1500000,
  2,
  1,
  NULL,
  'Quiet area with golden fixtures.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_golden-bay-area_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '252001df-c384-406b-939a-b8a29aa21f3e',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'a89b5fa9-eb8f-43f5-b243-d25ec66d7135',
  'Cua Dai Beach House',
  'house',
  'rental',
  1800000,
  3,
  1,
  NULL,
  'Walk to the beach in 2 minutes.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_cua-dai-beach-house_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '7000035d-3dbc-46bf-8268-af809da80b37',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '74d44da5-722a-414f-a5ce-2e4b8280c1f0',
  'Riverside Garden Villa',
  'villa',
  'rental',
  4500000,
  4,
  1,
  NULL,
  'Exquisite garden and river dock.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_riverside-garden-villa_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'a10cec77-3629-4ed3-b680-fd2882f0b4a0',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '4429d38b-3cde-40ef-a046-09ece4b7a138',
  'Son Tra Peninsula Resort',
  'villa',
  'rental',
  12000000,
  3,
  1,
  NULL,
  'Exclusive hillside villa with nature views.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_son-tra-peninsula-resort_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '8b714158-8a56-48c3-b32c-df9bb181fe57',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'e4be1e56-b533-4d37-87e0-a59b790b37a7',
  'F-Home Apartment',
  'apartment',
  'rental',
  1300000,
  1,
  1,
  NULL,
  'Compact city center living.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_f-home-apartment_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '7000035d-3dbc-46bf-8268-af809da80b37',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'd849cec2-4309-4edc-99bf-fab9180019e0',
  'Hidden Beach Bungalow',
  'house',
  'rental',
  1600000,
  1,
  1,
  NULL,
  'Private bungalow on a quiet stretch of beach.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_hidden-beach-bungalow_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '8b714158-8a56-48c3-b32c-df9bb181fe57',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  'ea19d707-82db-4558-91bb-6b0555330f44',
  'Euro Village Villa',
  'villa',
  'rental',
  6000000,
  4,
  1,
  NULL,
  'Secure compound living in Da Nang.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_euro-village-villa_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  'ba8e7f5c-6da1-42d7-adcc-476c083a907b',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, address, type, property_type, price, bedrooms, bathrooms, capacity, description, images, owner_id, business_id, amenities, rules)
VALUES (
  '709a7383-eab2-40e8-bdc5-aca31c77d57e',
  'Old Town Heritage House',
  'house',
  'rental',
  3200000,
  2,
  1,
  NULL,
  'Stay in a historic yellow house in Hoi An.',
  ARRAY['https://hkssuvamxdnqptyprsom.supabase.co/storage/v1/object/public/vendor-assets/seed/property_old-town-heritage-house_1.jpg'], 
  '3eaf883d-f14c-4545-9639-feae5412fc22',
  '252001df-c384-406b-939a-b8a29aa21f3e',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'f669228e-93e1-45ea-a3b4-76da47c9299c',
  'Da Nang International Fireworks Festival (DIFF) 2025',
  'The spectacular annual fireworks competition lighting up the Han River.',
  'Han River Port, Da Nang',
  '2026-05-31T20:00:00Z',
  '2026-07-12T23:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1533230125150-5a3d7c588a44?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  '8f4194f6-b26d-427a-bf94-5e183a0971a8',
  'IRONMAN 70.3 Vietnam 2025',
  'Premier triathlon event along Da Nang''s scenic coastline.',
  'Bien Dong Park, Da Nang',
  '2026-05-11T06:00:00Z',
  '2026-05-11T14:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'b824b91b-07c4-42e1-a074-4340b7e8a889',
  'Hoi An Lantern Festival (February)',
  'Magical lantern night in Hoi An Ancient Town.',
  'Hoi An Ancient Town',
  '2026-02-11T18:00:00Z',
  '2026-02-11T22:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1548625361-b8ae7bb03433?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'bc21252f-1b04-4e4f-9475-c2f336411483',
  'Hoi An Lantern Festival (March)',
  'Monthly lantern festival celebration.',
  'Hoi An Ancient Town',
  '2026-03-13T18:00:00Z',
  '2026-03-13T22:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1548625361-b8ae7bb03433?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  '46df65df-ea47-40c4-8ff4-5c02cbeaee77',
  'Da Nang International Marathon 2025',
  'Run across the famous bridges of Da Nang.',
  'Bien Dong Park',
  '2026-03-21T04:00:00Z',
  '2026-03-21T10:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'efbc976e-c54d-469d-bf4a-354db2a1d7e9',
  'Da Nang Color Festival',
  'Inspired by Holi, a vibrant celebration of color.',
  'Da Nang Beach',
  '2026-03-15T15:00:00Z',
  '2026-03-15T19:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'ad31e891-ceca-4fd9-a03a-70610fc5bcf0',
  'Quan The Am Festival',
  'Buddhist pilgrimage festival at Marble Mountains.',
  'Marble Mountains',
  '2026-03-16T08:00:00Z',
  '2026-03-18T17:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'b812d989-8cd2-4f39-a600-eff9e17765ee',
  'Vietnam-ASEAN Festival',
  'Cultural exchange featuring food and music.',
  'Dragon Bridge Plaza',
  '2026-06-06T09:00:00Z',
  '2026-06-07T21:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  '448ceb45-14b1-4191-b628-acc356eb048d',
  'Mid-Autumn Festival',
  'Celebration with mooncakes and lion dances.',
  'City Wide',
  '2026-09-17T18:00:00Z',
  '2026-09-17T22:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO events (id, title, description, location, start_at, end_at, status, ticket_price, image_url, organizer_id)
VALUES (
  'd18153ab-5a46-4b57-884f-3144239a5f4d',
  'Christmas at Ba Na Hills',
  'Winter wonderland in the french village.',
  'Ba Na Hills',
  '2026-12-20T09:00:00Z',
  '2026-12-25T21:00:00Z',
  'published',
  0,
  'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&q=80&w=1000',
  '3eaf883d-f14c-4545-9639-feae5412fc22'
) ON CONFLICT (id) DO NOTHING;
