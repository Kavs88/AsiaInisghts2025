-- =============================================================================
-- STAGING SEED: 036_staging_perf_seed.sql
-- Project  : Asia Insights / Sunday Market Platform
-- Purpose  : Performance validation seed — 200 properties + 500 events
-- Safety   : Additive only. No schema changes. No DROP/ALTER.
-- Idempotent: YES — aborts if ≥ 200 staging properties already present.
-- Staging  : Do NOT run in production.
-- Depends  : 001, 006, 009, 015, 016, 031, 032, 033
-- Rows     : 200 properties | 30 market_days | 500 events
-- Types    : retail (commercial/rental) | event_space | hospitality (villa/rental)
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 0: IDEMPOTENCY GUARD
-- Aborts the transaction if staging data is already loaded.
-- Re-run safely: the exception rolls back the whole transaction.
-- =============================================================================

DO $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM   public.properties
    WHERE  description ILIKE '%[staging-perf-seed]%'
  ) >= 200 THEN
    RAISE EXCEPTION
      'STAGING SEED ALREADY APPLIED: ≥ 200 staging properties found. '
      'Clear staging data first (delete WHERE description ILIKE ''%%[staging-perf-seed]%%'') '
      'then re-run.';
  END IF;

  RAISE NOTICE 'Idempotency check passed — proceeding with staging seed.';
END $$;


-- =============================================================================
-- SECTION 1: 200 PROPERTIES
--
-- Conceptual type → schema mapping:
--   retail      → type = 'commercial'  | property_type = 'rental'
--   event_space → type = 'other'       | property_type = 'event_space'
--   hospitality → type = 'villa'       | property_type = 'rental'
--
-- Distribution via (i % 3):
--   0 → retail       (67 rows)
--   1 → event_space  (67 rows)
--   2 → hospitality  (66 rows)
--
-- owner_id = NULL: allowed by migration 032 (admin-curated listings).
-- =============================================================================

INSERT INTO public.properties (
    id,
    owner_id,
    address,
    type,
    property_type,
    availability,
    price,
    bedrooms,
    bathrooms,
    square_meters,
    capacity,
    hourly_rate,
    daily_rate,
    description,
    images,
    contact_phone,
    contact_email,
    is_active,
    is_archived,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()  AS id,

    -- owner_id NULL = admin-curated (relaxed by migration 032 section 4)
    NULL::UUID         AS owner_id,

    -- Realistic Da Nang / Hoi An addresses
    CASE (i % 3)
        WHEN 0 THEN
            'Unit '  || i || ', ' ||
            (ARRAY['Han River','My Khe','Son Tra','Ngu Hanh Son','Thanh Khe','Cam Le']
            )[1 + (i % 6)] ||
            ' Commercial Strip, Da Nang'
        WHEN 1 THEN
            'Venue ' || i || ', ' ||
            (ARRAY['Cua Dai','An Bang Beach','Hoi An Old Town','Thu Bon Riverside',
                   'Marble Mountains','Dragon Bridge Precinct']
            )[1 + (i % 6)] ||
            ', Hoi An'
        ELSE
            'Villa ' || i || ', ' ||
            (ARRAY['My An','Phuoc My','An Thuong','Non Nuoc','Hoa Vang','Lang Co']
            )[1 + (i % 6)] ||
            ' District, Da Nang'
    END  AS address,

    -- type: must satisfy CHECK (type IN ('apartment','house','condo','villa','commercial','land','other'))
    CASE (i % 3)
        WHEN 0 THEN 'commercial'   -- retail
        WHEN 1 THEN 'other'        -- event_space
        ELSE        'villa'        -- hospitality
    END  AS type,

    -- property_type: CHECK (property_type IN ('rental','event_space'))
    CASE (i % 3)
        WHEN 1 THEN 'event_space'
        ELSE        'rental'
    END  AS property_type,

    -- availability: weighted — mostly available
    (ARRAY['available','available','available','rented','pending']
    )[1 + (i % 5)]  AS availability,

    -- price (monthly rental / listing price; CHECK price >= 0)
    CASE (i % 3)
        WHEN 0 THEN (500  + (i * 37  % 2000))::DECIMAL(12,2)   -- retail:      500–2500
        WHEN 1 THEN (800  + (i * 53  % 3200))::DECIMAL(12,2)   -- event_space: 800–4000
        ELSE        (1200 + (i * 61  % 4800))::DECIMAL(12,2)   -- hospitality: 1200–6000
    END  AS price,

    -- bedrooms (NULL for event_space / retail)
    CASE (i % 3)
        WHEN 2 THEN 1 + (i % 4)    -- hospitality: 1–4
        ELSE        NULL
    END  AS bedrooms,

    -- bathrooms (NULL for event_space / retail)
    CASE (i % 3)
        WHEN 2 THEN (1.0 + (i % 3))::DECIMAL(3,1)
        ELSE        NULL
    END  AS bathrooms,

    -- square_meters
    CASE (i % 3)
        WHEN 0 THEN (80  + (i * 17 % 400))::DECIMAL(10,2)   -- retail:      80–480
        WHEN 1 THEN (150 + (i * 29 % 850))::DECIMAL(10,2)   -- event_space: 150–1000
        ELSE        (60  + (i * 11 % 300))::DECIMAL(10,2)   -- hospitality: 60–360
    END  AS square_meters,

    -- capacity (event_space only; CHECK capacity > 0)
    CASE (i % 3)
        WHEN 1 THEN 50 + (i * 23 % 450)   -- 50–500 pax
        ELSE        NULL
    END  AS capacity,

    -- hourly_rate (event_space only)
    CASE (i % 3)
        WHEN 1 THEN (50 + (i * 13 % 250))::DECIMAL(10,2)
        ELSE        NULL
    END  AS hourly_rate,

    -- daily_rate (event_space only)
    CASE (i % 3)
        WHEN 1 THEN (300 + (i * 41 % 1700))::DECIMAL(10,2)
        ELSE        NULL
    END  AS daily_rate,

    -- description — carries staging marker for idempotency checks
    CASE (i % 3)
        WHEN 0 THEN
            'Premium retail space in a high-footfall commercial district. ' ||
            'Suitable for boutique shops, cafes, and service businesses. ' ||
            '[staging-perf-seed]'
        WHEN 1 THEN
            'Versatile event venue available for markets, workshops, pop-ups, ' ||
            'and private functions. AV and catering access on request. ' ||
            '[staging-perf-seed]'
        ELSE
            'Well-appointed villa offering hospitality-grade accommodation. ' ||
            'Ideal for extended stays, corporate retreats, and group bookings. ' ||
            '[staging-perf-seed]'
    END  AS description,

    -- placeholder images (no real CDN dependency in staging)
    ARRAY[
        'https://placehold.co/800x600?text=Property+' || i,
        'https://placehold.co/800x600?text=Interior+'  || i
    ]  AS images,

    '+84 ' || (900000000 + (i * 7919 % 99999999))::TEXT  AS contact_phone,
    'property' || i || '@staging.example.com'            AS contact_email,

    TRUE   AS is_active,
    FALSE  AS is_archived,

    -- stagger creation timestamps so ordering queries have spread
    NOW() - (i * INTERVAL '1 day')    AS created_at,
    NOW() - (i * INTERVAL '12 hours') AS updated_at

FROM generate_series(1, 200) AS i

-- Idempotency: skip entire batch if any staging property exists
WHERE NOT EXISTS (
    SELECT 1 FROM public.properties
    WHERE  description ILIKE '%[staging-perf-seed]%'
    LIMIT  1
);


-- =============================================================================
-- SECTION 2: 30 MARKET_DAYS (staging anchor rows for event linking)
--
-- Spread across the next 180 days (every 6th day = ~Sunday cadence).
-- UNIQUE(market_date) constraint handled with ON CONFLICT DO NOTHING.
-- These rows are identified later by their date range (future, ≤ 180 days out).
-- =============================================================================

INSERT INTO public.market_days (
    id,
    market_date,
    location_name,
    location_address,
    start_time,
    end_time,
    is_published,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()                       AS id,
    (CURRENT_DATE + (i * 6))::DATE          AS market_date,

    (ARRAY[
        'Han River Riverfront',
        'My Khe Beach Lawn',
        'Hoi An Old Town Plaza',
        'Dragon Bridge Square',
        'Ba Na Hills Base Camp',
        'Marble Mountains Forecourt',
        'Cua Dai Beach Park',
        'Son Tra Peninsula Green',
        'An Thuong Night Market',
        'Thu Bon Riverside Walk'
    ])[1 + (i % 10)]                        AS location_name,

    -- staging-identifiable address (used in Section 4 linkage CTE)
    'Da Nang & Hoi An Area, Vietnam [staging-perf-seed]'  AS location_address,

    '08:00'::TIME                           AS start_time,
    '14:00'::TIME                           AS end_time,

    (i % 2 = 0)                             AS is_published,  -- alternating draft / published

    NOW()  AS created_at,
    NOW()  AS updated_at

FROM generate_series(1, 30) AS i

-- UNIQUE(market_date): silently skip if a market day already exists on that date
ON CONFLICT (market_date) DO NOTHING;


-- =============================================================================
-- SECTION 3: 500 EVENTS
--
-- Distribution (by series offset i):
--   i   1– 300  → event_type = 'market'    (300 / 500 = 60 %)
--   i 301– 360  → event_type = 'event'     ( 60 / 500 = 12 %)
--   i 361– 410  → event_type = 'workshop'  ( 50 / 500 = 10 %)
--   i 411– 450  → event_type = 'meetup'    ( 40 / 500 =  8 %)
--   i 451– 475  → event_type = 'popup'     ( 25 / 500 =  5 %)
--   i 476– 500  → event_type = 'fair'      ( 25 / 500 =  5 %)
--
-- status: 'published' (even i) / 'draft' (odd i) — 50/50 within each type,
--         achieving the spec's "randomly distributed between draft and published".
--
-- start_at: proportionally spread across NOW() to NOW() + 180 days.
-- host_id : gen_random_uuid() — events.host_id has no FK constraint.
-- venue_type: 'custom' — safe for staging without real venue rows.
-- =============================================================================

INSERT INTO public.events (
    id,
    title,
    description,
    start_at,
    end_at,
    host_type,
    host_id,
    venue_type,
    venue_name,
    venue_address_json,
    status,
    event_type,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()  AS id,

    -- Title — realistic names per type
    CASE
        WHEN i <= 300 THEN
            (ARRAY[
                'Sunday Market',      'Weekend Market',     'Community Market',
                'Night Market',       'Pop-Up Market',      'Artisan Market',
                'Fresh Produce Market','Makers Market',     'Sunset Market',
                'Harbour Market'
            ])[1 + (i % 10)] || ' #' || i

        WHEN i <= 360 THEN
            (ARRAY[
                'Community Gathering','Cultural Evening',   'Social Mixer',
                'Neighbourhood Festival','Heritage Night',  'Lantern Evening',
                'Street Food Night',  'Culture Walk'
            ])[1 + (i % 8)] || ' #' || i

        WHEN i <= 410 THEN
            (ARRAY[
                'Pottery Workshop',   'Cooking Class',      'Photography Walk',
                'Batik Making',       'Jewellery Craft',    'Calligraphy Session',
                'Natural Dye Workshop','Silk Weaving Class'
            ])[1 + (i % 8)] || ' #' || i

        WHEN i <= 450 THEN
            (ARRAY[
                'Vendor Meetup',      'Maker Mixer',        'Community Roundtable',
                'Entrepreneur Breakfast','Artisan Network', 'Founder Lunch',
                'Design Collective',  'Creative Catchup'
            ])[1 + (i % 8)] || ' #' || i

        WHEN i <= 475 THEN
            (ARRAY[
                'Flash Pop-Up',       'Weekend Pop-Up',     'Curated Pop-Up',
                'Designer Pop-Up',    'Street Style Pop-Up','Food Pop-Up'
            ])[1 + (i % 6)] || ' #' || i

        ELSE
            (ARRAY[
                'Spring Fair',        'Heritage Fair',      'Craft Fair',
                'Food & Drink Fair',  'Family Fair',        'Night Fair'
            ])[1 + (i % 6)] || ' #' || i
    END  AS title,

    -- Description — carries staging marker for idempotency checks
    CASE
        WHEN i <= 300 THEN
            'Staging event: weekly market day with vendor stalls, artisan goods, '  ||
            'and fresh produce. [staging-perf-seed]'
        WHEN i <= 360 THEN
            'Staging event: community gathering celebrating local culture '          ||
            'and neighbourly connection. [staging-perf-seed]'
        WHEN i <= 410 THEN
            'Staging event: hands-on workshop with local artisan instructors. '      ||
            'Limited seats available. [staging-perf-seed]'
        WHEN i <= 450 THEN
            'Staging event: informal meetup for vendors, makers, and members. '      ||
            '[staging-perf-seed]'
        WHEN i <= 475 THEN
            'Staging event: curated pop-up shopping experience. '                    ||
            '[staging-perf-seed]'
        ELSE
            'Staging event: seasonal fair with multiple vendors and entertainment. ' ||
            '[staging-perf-seed]'
    END  AS description,

    -- start_at: proportionally spread across next 180 days
    NOW() + ((i::FLOAT / 500.0) * INTERVAL '180 days')  AS start_at,

    -- end_at: duration varies by type (market = 6 h, workshop = 2 h, others = 4 h)
    NOW() + ((i::FLOAT / 500.0) * INTERVAL '180 days')
         + CASE
               WHEN i <= 300 THEN INTERVAL '6 hours'
               WHEN i <= 410 THEN INTERVAL '2 hours'
               ELSE               INTERVAL '4 hours'
           END  AS end_at,

    -- host_type: CHECK (host_type IN ('vendor','user')) — use 'user' for staging
    'user'  AS host_type,

    -- host_id: no FK constraint on events.host_id — random UUID is safe
    gen_random_uuid()  AS host_id,

    -- venue_type: 'custom' avoids needing real venue FK rows
    'custom'  AS venue_type,

    -- venue_name (migration 033 section 5 — freeform display label)
    (ARRAY[
        'Han River Promenade',     'My Khe Beachfront',
        'Hoi An Old Town Square',  'Dragon Bridge Plaza',
        'Marble Mountains Area',   'Cua Dai Beach Lawn',
        'Son Tra Peninsula Park',  'An Thuong Expat Quarter',
        'Thu Bon Riverside',       'Ba Na Hills Terrace'
    ])[1 + (i % 10)]  AS venue_name,

    -- venue_address_json: rich JSON for display without FK dependency
    jsonb_build_object(
        'name',    (ARRAY[
                       'Han River Promenade',    'My Khe Beachfront',
                       'Hoi An Old Town Square', 'Dragon Bridge Plaza',
                       'Marble Mountains Area',  'Cua Dai Beach Lawn',
                       'Son Tra Peninsula Park', 'An Thuong Expat Quarter',
                       'Thu Bon Riverside',      'Ba Na Hills Terrace'
                   ])[1 + (i % 10)],
        'city',    CASE WHEN i % 3 = 0 THEN 'Da Nang' ELSE 'Hoi An' END,
        'country', 'Vietnam',
        'staging', true
    )  AS venue_address_json,

    -- status: alternates published / draft — satisfies "randomly distributed" spec
    CASE WHEN i % 2 = 0 THEN 'published' ELSE 'draft' END  AS status,

    -- event_type: see distribution comment above
    CASE
        WHEN i <= 300 THEN 'market'
        WHEN i <= 360 THEN 'event'
        WHEN i <= 410 THEN 'workshop'
        WHEN i <= 450 THEN 'meetup'
        WHEN i <= 475 THEN 'popup'
        ELSE               'fair'
    END  AS event_type,

    -- stagger created_at so time-ordered queries see a realistic spread
    NOW() - ((500 - i) * INTERVAL '2 hours')  AS created_at,
    NOW()                                      AS updated_at

FROM generate_series(1, 500) AS i

-- Idempotency: skip entire batch if any staging event exists
WHERE NOT EXISTS (
    SELECT 1 FROM public.events
    WHERE  description ILIKE '%[staging-perf-seed]%'
    LIMIT  1
);


-- =============================================================================
-- SECTION 4: LINK MARKET EVENTS → MARKET_DAYS
--
-- Pairs the 30 earliest staging market events (by created_at) to the 30
-- staging market_days (ordered by market_date ASC) via market_days.event_id.
-- Only updates rows where event_id IS NULL (safe re-run).
-- =============================================================================

WITH ordered_market_events AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
    FROM   public.events
    WHERE  event_type   = 'market'
      AND  description  ILIKE '%[staging-perf-seed]%'
    LIMIT  30
),
ordered_staging_days AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY market_date ASC) AS rn
    FROM   public.market_days
    WHERE  location_address ILIKE '%[staging-perf-seed]%'
      AND  event_id IS NULL
    LIMIT  30
)
UPDATE public.market_days md
SET    event_id = ome.id
FROM   ordered_staging_days osd
JOIN   ordered_market_events ome ON ome.rn = osd.rn
WHERE  md.id = osd.id;


-- =============================================================================
-- SECTION 5: VERIFICATION — counts and ratio check
-- =============================================================================

DO $$
DECLARE
    v_props       INT;
    v_events      INT;
    v_mdays       INT;
    v_linked      INT;
    v_market_pct  NUMERIC;
    v_pub_pct     NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_props
    FROM   public.properties
    WHERE  description ILIKE '%[staging-perf-seed]%';

    SELECT COUNT(*) INTO v_events
    FROM   public.events
    WHERE  description ILIKE '%[staging-perf-seed]%';

    SELECT COUNT(*) INTO v_mdays
    FROM   public.market_days
    WHERE  location_address ILIKE '%[staging-perf-seed]%';

    SELECT COUNT(*) INTO v_linked
    FROM   public.market_days
    WHERE  location_address ILIKE '%[staging-perf-seed]%'
      AND  event_id IS NOT NULL;

    SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE event_type = 'market')
                       / NULLIF(COUNT(*), 0), 1)
    INTO   v_market_pct
    FROM   public.events
    WHERE  description ILIKE '%[staging-perf-seed]%';

    SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'published')
                       / NULLIF(COUNT(*), 0), 1)
    INTO   v_pub_pct
    FROM   public.events
    WHERE  description ILIKE '%[staging-perf-seed]%';

    RAISE NOTICE '==========================================';
    RAISE NOTICE 'STAGING SEED VERIFICATION';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Properties inserted : % / 200',  v_props;
    RAISE NOTICE 'Events inserted     : % / 500',  v_events;
    RAISE NOTICE 'Market days created : % / 30',   v_mdays;
    RAISE NOTICE 'Market days linked  : % / 30',   v_linked;
    RAISE NOTICE 'Market event %%      : %%  (target 60%%)', v_market_pct;
    RAISE NOTICE 'Published event %%   : %%  (target ~50%%)', v_pub_pct;
    RAISE NOTICE '==========================================';

    -- Soft assertions (NOTICE not EXCEPTION — allows inspection after commit)
    IF v_props < 200 THEN
        RAISE WARNING 'Expected 200 properties, got %. Check for UNIQUE conflicts.', v_props;
    END IF;
    IF v_events < 500 THEN
        RAISE WARNING 'Expected 500 events, got %. Check for constraint violations.', v_events;
    END IF;
END $$;

COMMIT;


-- =============================================================================
-- TEARDOWN (run manually to remove all staging data — never auto-execute)
-- =============================================================================
/*
BEGIN;

DELETE FROM public.market_days
WHERE  location_address ILIKE '%[staging-perf-seed]%';

DELETE FROM public.events
WHERE  description ILIKE '%[staging-perf-seed]%';

DELETE FROM public.properties
WHERE  description ILIKE '%[staging-perf-seed]%';

COMMIT;
*/
