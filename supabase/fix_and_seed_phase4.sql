-- FIX AND SEED PHASE 4 SCRIPT (v2 - HYBRID SCHEMA)
-- Purpose: Fix Schema Drift where different APIs expect different columns.
-- /api/events expects: vendor_id
-- /api/discovery expects: host_id, host_type

-- ==========================================
-- STEP 1: RESET TABLES
-- ==========================================
DROP TABLE IF EXISTS public.user_event_intents CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;

-- ==========================================
-- STEP 2: CREATE EVENTS TABLE (Hybrid Schema)
-- ==========================================
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  
  -- Hybrid: Support both patterns
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE, -- For /api/events join
  host_id UUID, -- For /api/discovery
  host_type TEXT CHECK (host_type IN ('vendor', 'user')), -- For /api/discovery
  
  organizer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Location & Metadata
  venue_type TEXT DEFAULT 'custom' CHECK (venue_type IN ('vendor', 'property', 'custom')),
  venue_id UUID, -- Can reference properties(id) or vendors(id) based on venue_type
  location TEXT, 
  venue_address_json JSONB, 
  category TEXT, -- 'workshop', 'market', etc.
  image_url TEXT,
  
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Vendor Write Events" ON public.events FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- STEP 3: CREATE DEALS TABLE
-- ==========================================
CREATE TABLE public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  -- Note: /api/discovery tries to join deals on event_id, but current schema doesn't support it well.
  -- We won't add event_id to deals for now unless strictly needed, as it's not in the main migration.
  -- Focus on getting Events visible first.
  title TEXT NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Deals" ON public.deals FOR SELECT USING (true);
CREATE POLICY "Vendor Write Deals" ON public.deals FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- STEP 4: RECREATE USER INTENTS (RSVP)
-- ==========================================
CREATE TABLE public.user_event_intents (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, event_id)
);
ALTER TABLE public.user_event_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intents" ON public.user_event_intents 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public view counts" ON public.user_event_intents FOR SELECT USING (true);

-- ==========================================
-- STEP 5: SEED DEMO DATA
-- ==========================================

WITH luna AS (SELECT id, 'Luna Studio' as loc FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1),
     green AS (SELECT id, 'Greenway Kitchen' as loc FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1),
     soap AS (SELECT id, 'Stall #8' as loc FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1),
     farm AS (SELECT id, 'Riverside Zone A' as loc FROM vendors WHERE name = 'Farm Fresh Produce' LIMIT 1)

INSERT INTO events (id, vendor_id, host_id, host_type, title, description, start_at, end_at, status, location, category, image_url)
SELECT 
  gen_random_uuid(),
  luna.id, luna.id, 'vendor', -- Populate BOTH vendor_id and host_id
  'Pottery Wheel Basic Workshop',
  'Learn the basics of throwing on the wheel. A 2-hour introductory class.',
  (now() + INTERVAL '3 days' + INTERVAL '10 hours'),
  (now() + INTERVAL '3 days' + INTERVAL '12 hours'),
  'published',
  luna.loc,
  'workshop',
  'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800&fit=crop'
FROM luna
UNION ALL
SELECT 
  gen_random_uuid(),
  green.id, green.id, 'vendor',
  'Sourdough Starter Masterclass',
  'Master the art of sourdough. Take home your own starter.',
  (now() + INTERVAL '5 days' + INTERVAL '14 hours'),
  (now() + INTERVAL '5 days' + INTERVAL '16 hours'),
  'published',
  green.loc,
  'workshop',
  'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&fit=crop'
FROM green
UNION ALL
SELECT 
  gen_random_uuid(),
  soap.id, soap.id, 'vendor',
  'Natural Soap Making Demo',
  'Free demonstration of lavender soap processing.',
  (now() + INTERVAL '7 days' + INTERVAL '11 hours'),
  (now() + INTERVAL '7 days' + INTERVAL '12 hours'),
  'published',
  soap.loc,
  'demonstration',
  'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&fit=crop'
FROM soap
UNION ALL
SELECT 
  gen_random_uuid(),
  farm.id, farm.id, 'vendor',
  'Summer Harvest Tasting',
  'Taste the best seasonal fruits.',
  (now() + INTERVAL '6 days' + INTERVAL '9 hours'),
  (now() + INTERVAL '6 days' + INTERVAL '13 hours'),
  'published',
  farm.loc,
  'tasting',
  'https://images.unsplash.com/photo-1615485500704-8e99099928b3?w=800&fit=crop'
FROM farm;

-- Insert Deals (Same as before)
WITH luna AS (SELECT id FROM vendors WHERE name = 'Luna Ceramics' LIMIT 1),
     green AS (SELECT id FROM vendors WHERE name = 'Greenway Bakery' LIMIT 1),
     soap AS (SELECT id FROM vendors WHERE name = 'Artisan Soaps' LIMIT 1)
INSERT INTO deals (id, vendor_id, title, description, valid_from, valid_to, status)
SELECT
  gen_random_uuid(),
  luna.id,
  '15% Off Dinner Sets',
  'Complete 4-piece dinner set discount.',
  now(),
  (now() + INTERVAL '30 days'),
  'active'
FROM luna
UNION ALL
SELECT
  gen_random_uuid(),
  green.id,
  'Buy One Get One Croissant',
  'Available first hour only.',
  now(),
  (now() + INTERVAL '14 days'),
  'active'
FROM green
UNION ALL
SELECT
  gen_random_uuid(),
  soap.id,
  'Soap Trio Bundle ($30)',
  'Mix and match any 3 scents.',
  now(),
  (now() + INTERVAL '60 days'),
  'active'
FROM soap;
