
-- Seed properties for RC2
-- Links to existing businesses via subqueries

INSERT INTO properties (
  business_id,
  type,
  property_type, 
  address,
  price,
  bedrooms,
  bathrooms,
  capacity,
  description,
  images,
  location_coords,
  availability,
  is_active
) VALUES 
-- 1. Villa Example (Linked to Enouvo Space or similar if exists, otherwise null/generic)
(
  (SELECT id FROM businesses WHERE slug = 'enouvo-space' LIMIT 1), -- Assuming Enouvo might have a coliving space
  'villa',
  'rental',
  '123 An Thuong 4, My An, Da Nang',
  2500000, -- Price per night in VND
  4,
  5,
  8,
  'Luxurious modern villa with private pool, just steps from My Khe Beach. Perfect for digital nomads and families. Features high-speed fiber internet, coworking setup, and daily housekeeping.',
  ARRAY[
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80'
  ],
  ST_SetSRID(ST_MakePoint(108.243, 16.054), 4326),
  'available',
  true
),
-- 2. Apartment Example
(
  (SELECT id FROM businesses WHERE slug = 'roots-plant-based-cafe' LIMIT 1), -- Just associating with a valid business ID for foreign key
  'apartment',
  'rental',
  '45 Le Quang Dao, Da Nang',
  1200000,
  2,
  2,
  4,
  'Modern 2-bedroom apartment with ocean view. Fully furnished kitchen, smart TV, and access to building gym and pool. Located in the heart of the expat district.',
  ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80'
  ],
  ST_SetSRID(ST_MakePoint(108.240, 16.058), 4326),
  'available',
  true
),
-- 3. Event Space Example (Relevant for "Event Venues" filter)
(
  (SELECT id FROM businesses WHERE slug = 'barefoot-beach-club' LIMIT 1),
  'event_space',
  'event_space',
  'My Khe Beach, Da Nang',
  5000000, -- Hourly rate implied or daily?
  0,
  4,
  200,
  'Stunning beachfront venue perfect for sunset parties, corporate retreats, and weddings. Full catering service available. Capacity up to 200 guests.',
  ARRAY[
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=1600&q=80'
  ],
  ST_SetSRID(ST_MakePoint(108.245, 16.060), 4326),
  'available',
  true
),
-- 4. House Example
(
  (SELECT id FROM businesses WHERE slug = 'six-on-six' LIMIT 1),
  'house',
  'rental',
  'Friendly Neighborhood, Hoi An',
  1800000,
  3,
  3,
  6,
  'Charming heritage house in Hoi An. Experience traditional architecture with modern comforts. deeply quiet and peaceful garden.',
  ARRAY[
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'
  ],
  ST_SetSRID(ST_MakePoint(108.328, 15.877), 4326),
  'available',
  true
);
