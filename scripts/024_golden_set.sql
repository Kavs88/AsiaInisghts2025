
-- 024_golden_set.sql
-- The "Golden Set" of seed data to make the platform feel alive.
-- 1. Mock Profiles (Residents, Expats, Founders)
-- 2. Social Proof (Saves & Recommendations)
-- 3. Market Events & RSVPs
-- 4. Vendor Orders (Mock)

-- A. MOCK PROFILES (Insert into public.profiles directly - bypassing auth.users for display only)
-- Note: In a real app, these would be linked to auth.users. For dev/demo, we just need profiles.
INSERT INTO profiles (id, first_name, last_name, email, avatar_url, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Jenkins', 'sarah.j@example.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', 'resident'),
  ('00000000-0000-0000-0000-000000000002', 'David', 'Chen', 'david.c@example.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', 'expat'),
  ('00000000-0000-0000-0000-000000000003', 'Elena', 'Rodriguez', 'elena.r@example.com', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', 'resident'),
  ('00000000-0000-0000-0000-000000000004', 'Michael', 'Ross', 'mike.r@example.com', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', 'expat'),
  ('00000000-0000-0000-0000-000000000005', 'Jenny', 'Nguyen', 'jenny.n@example.com', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', 'resident')
ON CONFLICT (id) DO NOTHING;

-- B. SOCIAL PROOF (Saves/Founders Notes)
-- Link these profiles to entities via 'user_entity_signals' (if exists) or 'bookmarks'
-- Assuming 'user_entity_signals' is the source of truth for "Saves"

-- Banh Mi Phuong Saves
INSERT INTO user_entity_signals (user_id, entity_id, signal_type, created_at)
SELECT 
  p.id, 
  (SELECT id FROM entities WHERE slug = 'banh-mi-phuong'), 
  'save',
  NOW() - (random() * interval '30 days')
FROM profiles p
WHERE p.email IN ('sarah.j@example.com', 'david.c@example.com', 'jenny.n@example.com')
ON CONFLICT DO NOTHING;

-- Enouvo Space Saves
INSERT INTO user_entity_signals (user_id, entity_id, signal_type, created_at)
SELECT 
  p.id, 
  (SELECT id FROM entities WHERE slug = 'enouvo-space'), 
  'save',
  NOW() - (random() * interval '30 days')
FROM profiles p
WHERE p.email IN ('mike.r@example.com', 'elena.r@example.com')
ON CONFLICT DO NOTHING;


-- C. MARKET EVENTS (Populate /markets/market-days)
-- Ensure we have a recurring market event
INSERT INTO events (
  title, 
  description, 
  start_time, 
  end_time, 
  location_name, 
  location_address, 
  event_type, 
  cover_image_url
) VALUES 
(
  'Sunday Market: Holiday Special',
  'Join us for a special holiday edition of the Sunday Market. Featuring live music, mulled wine, and over 50 local artisan vendors.',
  (CURRENT_DATE + interval '2 days' + time '09:00'),
  (CURRENT_DATE + interval '2 days' + time '16:00'),
  'Riverside Park',
  'Tran Hung Dao, Da Nang',
  'market',
  'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=1600&q=80'
),
(
  'Sunday Market: New Year Kickoff',
  'Start the year right with fresh organic produce and healthy lifestyle workshops.',
  (CURRENT_DATE + interval '9 days' + time '09:00'),
  (CURRENT_DATE + interval '9 days' + time '16:00'),
  'Riverside Park',
  'Tran Hung Dao, Da Nang',
  'market',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80'
)
ON CONFLICT DO NOTHING;

-- D. EVENT ATTENDEES (RSVPs)
-- Link profiles to events
INSERT INTO event_attendees (user_id, event_id, status)
SELECT 
  p.id,
  e.id,
  'going'
FROM profiles p
CROSS JOIN events e
WHERE e.title LIKE 'Sunday Market%'
AND random() > 0.5 -- Random attendance
ON CONFLICT DO NOTHING;

-- E. FOUNDER INSIGHTS (Additional High-Fidelity content)
-- Adding a "Founder Note" to a new entity to show depth
INSERT INTO founder_notes (entity_id, note, tags, confidence_score)
SELECT 
  id, 
  'The best spot for digital nomads. The internet is consistent (100mbps+), and the community lunch at 12pm is a great way to meet people. Ask for Tram, she runs the place.', 
  ARRAY['Digital Nomad', 'High-Speed Wifi', 'Community'], 
  0.95
FROM entities WHERE slug = 'enouvo-space'
ON CONFLICT DO NOTHING;

