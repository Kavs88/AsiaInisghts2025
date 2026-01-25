# SQL Code to Run Manually in Supabase Dashboard

**Project:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor

**Run these in order:**

---

## STEP 1: Create Tables (006_schema.sql)

Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor

**Copy and paste this entire block:**

```sql
-- Migration: 006_properties_events_businesses_schema.sql
-- Description: Schema for Properties, Events, and Business Directory modules
-- Created: 2025-01-29
-- Dependencies: 001_initial_schema.sql

-- ============================================
-- PROPERTIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('apartment', 'house', 'condo', 'villa', 'commercial', 'land', 'other')),
    availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'rented', 'sold', 'pending', 'unavailable')),
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms DECIMAL(3, 1) CHECK (bathrooms >= 0),
    square_meters DECIMAL(10, 2) CHECK (square_meters >= 0),
    description TEXT,
    images TEXT[],
    location_coords POINT,
    contact_phone TEXT,
    contact_email TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON public.properties(availability);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    location TEXT NOT NULL,
    location_coords POINT,
    ticket_price DECIMAL(10, 2) CHECK (ticket_price >= 0),
    ticket_url TEXT,
    max_attendees INTEGER CHECK (max_attendees > 0),
    current_attendees INTEGER DEFAULT 0 CHECK (current_attendees >= 0),
    category TEXT,
    images TEXT[],
    contact_phone TEXT,
    contact_email TEXT,
    website_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_is_published ON public.events(is_published);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);

-- ============================================
-- BUSINESSES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    address TEXT NOT NULL,
    location_coords POINT,
    website_url TEXT,
    opening_hours JSONB,
    social_links JSONB,
    logo_url TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses indexes
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON public.businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_is_verified ON public.businesses(is_verified);
CREATE INDEX IF NOT EXISTS idx_businesses_created_at ON public.businesses(created_at DESC);

-- Full-text search index for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_search ON public.businesses 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
```

**Click "Run" or press Ctrl+Enter**

**Expected:** ✅ Success - Tables created, indexes created, triggers created, RLS enabled

---

## STEP 2: Create RLS Policies (007_rls.sql)

**In the same SQL Editor, create a new query and paste this:**

```sql
-- Migration: 007_properties_events_businesses_rls.sql
-- Description: RLS policies for Properties, Events, and Business Directory modules
-- Created: 2025-01-29

-- ============================================
-- PROPERTIES TABLE POLICIES
-- ============================================

-- Public can view active, available properties
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;
CREATE POLICY "Public can view available properties" ON public.properties
    FOR SELECT USING (is_active = TRUE AND availability IN ('available', 'pending'));

-- Property owners can view their own properties (even if inactive)
DROP POLICY IF EXISTS "Owners can view own properties" ON public.properties;
CREATE POLICY "Owners can view own properties" ON public.properties
    FOR SELECT USING (owner_id = auth.uid());

-- Property owners can manage their own properties
DROP POLICY IF EXISTS "Owners can manage own properties" ON public.properties;
CREATE POLICY "Owners can manage own properties" ON public.properties
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Admins can view all properties
DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all properties
DROP POLICY IF EXISTS "Admins can manage all properties" ON public.properties;
CREATE POLICY "Admins can manage all properties" ON public.properties
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- EVENTS TABLE POLICIES
-- ============================================

-- Public can view published, active events
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events" ON public.events
    FOR SELECT USING (is_published = TRUE AND is_active = TRUE);

-- Organizers can view their own events (even if unpublished)
DROP POLICY IF EXISTS "Organizers can view own events" ON public.events;
CREATE POLICY "Organizers can view own events" ON public.events
    FOR SELECT USING (organizer_id = auth.uid());

-- Organizers can manage their own events
DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
CREATE POLICY "Organizers can manage own events" ON public.events
    FOR ALL USING (organizer_id = auth.uid())
    WITH CHECK (organizer_id = auth.uid());

-- Admins can view all events
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all events
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
CREATE POLICY "Admins can manage all events" ON public.events
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- BUSINESSES TABLE POLICIES
-- ============================================

-- Public can view active businesses
DROP POLICY IF EXISTS "Public can view active businesses" ON public.businesses;
CREATE POLICY "Public can view active businesses" ON public.businesses
    FOR SELECT USING (is_active = TRUE);

-- Business owners can view their own businesses (even if inactive)
DROP POLICY IF EXISTS "Owners can view own businesses" ON public.businesses;
CREATE POLICY "Owners can view own businesses" ON public.businesses
    FOR SELECT USING (owner_id = auth.uid());

-- Business owners can manage their own businesses
DROP POLICY IF EXISTS "Owners can manage own businesses" ON public.businesses;
CREATE POLICY "Owners can manage own businesses" ON public.businesses
    FOR ALL USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- Admins can view all businesses
DROP POLICY IF EXISTS "Admins can view all businesses" ON public.businesses;
CREATE POLICY "Admins can view all businesses" ON public.businesses
    FOR SELECT USING (is_admin(auth.uid()));

-- Admins can manage all businesses
DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;
CREATE POLICY "Admins can manage all businesses" ON public.businesses
    FOR ALL USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
```

**Click "Run" or press Ctrl+Enter**

**Expected:** ✅ Success - All policies created

---

## STEP 3: Seed Data (008_seed.sql) - OPTIONAL

**⚠️ Only run this if you want test data. Skip if you don't need seed data.**

**In the same SQL Editor, create a new query and paste this:**

```sql
-- Migration: 008_seed_properties_events_businesses.sql
-- Description: Deterministic seed data for Properties, Events, and Business Directory
-- Note: This requires user accounts to exist. Uses first admin user as owner.

-- ============================================
-- SAMPLE PROPERTIES
-- ============================================

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
    (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1),
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
-- SAMPLE EVENTS
-- ============================================

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
-- SAMPLE BUSINESSES
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
```

**Click "Run" or press Ctrl+Enter**

**Expected:** ✅ Success - 3 properties, 3 events, 3 businesses created

---

## Verification Queries

**After running all SQL, verify with these queries:**

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('properties', 'events', 'businesses')
ORDER BY table_name;
```

**Expected:** 3 rows (properties, events, businesses)

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename;
```

**Expected:** All should show `rowsecurity = true`

### Check Policies
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('properties', 'events', 'businesses')
ORDER BY tablename, policyname;
```

**Expected:** Multiple policies for each table

### Check Seed Data (if you ran Step 3)
```sql
SELECT 
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM events) as events_count,
  (SELECT COUNT(*) FROM businesses) as businesses_count;
```

**Expected:** All counts should be 3

---

## Quick Links

- **SQL Editor:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
- **Table Editor:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
- **Functions:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions

---

**Done!** After running these SQL scripts, proceed to deploy Edge Functions via CLI.






