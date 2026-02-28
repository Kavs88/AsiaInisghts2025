-- =============================================================================
-- Migration: 033_consolidation_uplift.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Stage Alignment & System Consolidation — schema uplift.
--
--   Section 1:  properties.created_by          — audit trail for curated listings
--   Section 2:  properties.archived_at/by      — archive event audit trail
--   Section 3:  vendors.user_id FK fix          — CASCADE → SET NULL
--   Section 4:  vendors.is_claimed              — consistency with businesses/entities
--   Section 5:  events.venue_name               — freeform label fallback
--   Section 6:  market_metadata table           — optional market-specific metadata
--   Section 7:  Landlord RLS on events          — landlords see events at own properties
--   Section 8:  market_days backfill            — event records for legacy rows without event_id
--
-- Safety:    Fully additive. No columns dropped. No data deleted. Rollback section included.
-- Depends:   001, 006, 007, 017, 029, 030, 031, 032
-- =============================================================================


-- =============================================================================
-- PRE-FLIGHT CHECKS (run manually before applying in production)
-- =============================================================================
/*
  -- Confirm properties table has owner_id and is_archived
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'properties'
    AND column_name IN ('owner_id', 'is_archived', 'active_from', 'active_until');
  -- Expected: 4 rows

  -- Confirm vendors.user_id FK name (needed for Section 3 DROP)
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.vendors'::regclass AND contype = 'f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.vendors'::regclass AND attname = 'user_id')::smallint
    ];

  -- Count market_days without event_id (Section 8 backfill scope)
  SELECT COUNT(*) FROM public.market_days WHERE event_id IS NULL;

  -- Confirm events table has event_type and property_id (from 031)
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events'
    AND column_name IN ('event_type', 'property_id');
  -- Expected: 2 rows
*/


-- =============================================================================
-- SECTION 1: properties.created_by
-- Audit trail for who submitted a listing.
-- Mirrors the pattern applied to businesses and entities in migration 029.
-- Allows admin-curated property listings without a registered landlord account.
-- =============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS created_by UUID
  REFERENCES public.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.properties.created_by IS
  'User who originally submitted this listing. NULL = migrated/seeded record.
   Mirrors businesses.created_by pattern (migration 029).
   owner_id = current owner (may differ after ownership transfer).
   created_by = original submitter (audit, never changes).';

CREATE INDEX IF NOT EXISTS idx_properties_created_by
  ON public.properties(created_by)
  WHERE created_by IS NOT NULL;

-- Backfill: where owner_id is set, created_by = owner_id (safe one-time backfill)
-- This mirrors the migration 029 backfill for businesses.
UPDATE public.properties
SET created_by = owner_id
WHERE created_by IS NULL
  AND owner_id IS NOT NULL;

RAISE NOTICE 'Section 1: properties.created_by added and backfilled.';


-- =============================================================================
-- SECTION 2: properties.archived_at / properties.archived_by
-- Archive audit trail. When is_archived flips TRUE, we need to know when and by whom.
-- Both nullable — only populated at the moment of archiving via server action.
-- is_archived itself already exists from migration 032.
-- =============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS archived_by UUID
  REFERENCES public.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.properties.archived_at IS
  'Timestamp when this property was archived. NULL = not archived. Set by server action.';

COMMENT ON COLUMN public.properties.archived_by IS
  'User who performed the archive action. FK to users. NULL = not archived or actor unknown.';

CREATE INDEX IF NOT EXISTS idx_properties_archived_by
  ON public.properties(archived_by)
  WHERE archived_by IS NOT NULL;

-- Trigger: auto-populate archived_at when is_archived flips TRUE
-- Uses SECURITY DEFINER so it can read auth.uid() in trigger context.
CREATE OR REPLACE FUNCTION public.stamp_property_archive()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = TRUE AND (OLD.is_archived = FALSE OR OLD.is_archived IS NULL) THEN
    NEW.archived_at := NOW();
    -- archived_by must be set explicitly by the calling server action via WITH CHECK.
    -- We do not auto-set it from auth.uid() in triggers as it may be NULL in some contexts.
  END IF;

  -- If un-archived, clear the audit stamp
  IF NEW.is_archived = FALSE AND OLD.is_archived = TRUE THEN
    NEW.archived_at := NULL;
    NEW.archived_by := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_stamp_property_archive ON public.properties;

CREATE TRIGGER trigger_stamp_property_archive
  BEFORE UPDATE OF is_archived ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.stamp_property_archive();

COMMENT ON FUNCTION public.stamp_property_archive() IS
  'Auto-stamps archived_at when is_archived flips to TRUE. Clears stamp on restore.
   archived_by must be set explicitly by the server action before the UPDATE.';

RAISE NOTICE 'Section 2: properties.archived_at, archived_by, and trigger added.';


-- =============================================================================
-- SECTION 3: vendors.user_id FK — CASCADE → SET NULL
-- Original FK (migration 001) was ON DELETE CASCADE.
-- This means deleting a user account deletes their vendor record, losing all
-- products, stall history, and portfolio items.
-- Matching the pattern applied to businesses (029) and properties (032).
-- =============================================================================

DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.vendors'::regclass
    AND contype  = 'f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.vendors'::regclass
         AND attname  = 'user_id')::smallint
    ];

  IF fk_name IS NOT NULL AND fk_name != 'vendors_user_id_set_null_fkey' THEN
    EXECUTE format('ALTER TABLE public.vendors DROP CONSTRAINT %I', fk_name);
    RAISE NOTICE 'Section 3: Dropped old vendors.user_id FK: %', fk_name;
  ELSE
    RAISE NOTICE 'Section 3: vendors.user_id FK already correct or not found, skipping drop.';
  END IF;
END $$;

ALTER TABLE public.vendors
  DROP CONSTRAINT IF EXISTS vendors_user_id_set_null_fkey;

ALTER TABLE public.vendors
  ADD CONSTRAINT vendors_user_id_set_null_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.vendors.user_id IS
  'FK to users. Nullable — allows admin-curated vendor records without a registered account.
   ON DELETE SET NULL: deleting a user account orphans the vendor record (does not cascade-delete).
   is_claimed = false when user_id is NULL.';

RAISE NOTICE 'Section 3: vendors.user_id FK changed to ON DELETE SET NULL.';


-- =============================================================================
-- SECTION 4: vendors.is_claimed
-- Ownership claim flag. Mirrors businesses.is_claimed (migration 029).
-- When user_id IS NULL → vendor is admin-curated, not yet claimed.
-- When user_id IS NOT NULL AND is_claimed = true → user owns this vendor record.
-- =============================================================================

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.vendors.is_claimed IS
  'TRUE = the registered user (user_id) has claimed ownership of this vendor record.
   FALSE = admin-curated listing or unverified self-signup.
   Mirrors businesses.is_claimed and entities.is_claimed patterns.';

CREATE INDEX IF NOT EXISTS idx_vendors_is_claimed
  ON public.vendors(is_claimed);

-- Backfill: vendors with an existing user_id were self-registered → treat as claimed
UPDATE public.vendors
SET is_claimed = true
WHERE user_id IS NOT NULL
  AND is_claimed = false;

RAISE NOTICE 'Section 4: vendors.is_claimed added and backfilled.';


-- =============================================================================
-- SECTION 5: events.venue_name
-- Freeform venue display label for events that do not reference a property via FK.
-- When property_id IS SET: properties.address is authoritative (do not use venue_name).
-- When property_id IS NULL: venue_name holds the human-readable location string.
-- Avoids littering events.location with mixed-purpose data.
-- =============================================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS venue_name TEXT;

COMMENT ON COLUMN public.events.venue_name IS
  'Human-readable venue label. Only used when property_id IS NULL.
   When property_id IS SET, properties.address is authoritative.
   Do not duplicate: populate one or the other, never both.';

RAISE NOTICE 'Section 5: events.venue_name added.';


-- =============================================================================
-- SECTION 6: market_metadata table
-- Optional metadata for events where event_type = ''market''.
-- Keeps market-specific fields off the generic events table.
-- 1:1 with events (event_id is PK and FK).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.market_metadata (
  event_id            UUID        PRIMARY KEY
                                  REFERENCES public.events(id) ON DELETE CASCADE,
  market_day_id       UUID        REFERENCES public.market_days(id) ON DELETE SET NULL,
  theme               TEXT,                        -- e.g. "Night Market", "Artisan Focus"
  expected_stalls     INTEGER,                     -- planned stall capacity
  featured_vendor_ids UUID[]      DEFAULT '{}',    -- curated vendor spotlight (array of vendor IDs)
  organiser_notes     TEXT,                        -- internal notes for market admin
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.market_metadata IS
  'Optional market-specific metadata for events with event_type = ''market''.
   1:1 with events. Only create a row here when the event is a market day.
   Keeps the generic events table free of market-specific columns.';

COMMENT ON COLUMN public.market_metadata.event_id IS
  'PK and FK to events. ON DELETE CASCADE: removing the event removes its market metadata.';

COMMENT ON COLUMN public.market_metadata.market_day_id IS
  'FK to market_days for operational back-office linkage. ON DELETE SET NULL.
   When market_days.event_id is set, this references the same market_day.';

COMMENT ON COLUMN public.market_metadata.featured_vendor_ids IS
  'Array of vendors.id values spotlighted for this market event.
   Denormalised for read performance. Validate referential integrity in server actions.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_market_metadata_market_day_id
  ON public.market_metadata(market_day_id)
  WHERE market_day_id IS NOT NULL;

-- RLS
ALTER TABLE public.market_metadata ENABLE ROW LEVEL SECURITY;

-- Public read (market metadata is public information)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Market metadata is publicly readable" ON public.market_metadata;
  CREATE POLICY "Market metadata is publicly readable"
    ON public.market_metadata FOR SELECT
    USING (true);
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 6: Could not create market_metadata SELECT policy: %', SQLERRM;
END $$;

-- Admin / Founder write
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage market metadata" ON public.market_metadata;
  CREATE POLICY "Admins manage market metadata"
    ON public.market_metadata FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id   = auth.uid()
          AND role IN ('admin', 'superadmin', 'super_user', 'founder')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id   = auth.uid()
          AND role IN ('admin', 'superadmin', 'super_user', 'founder')
      )
    );
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 6: Could not create market_metadata admin policy: %', SQLERRM;
END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_market_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_market_metadata_updated_at ON public.market_metadata;
CREATE TRIGGER update_market_metadata_updated_at
  BEFORE UPDATE ON public.market_metadata
  FOR EACH ROW EXECUTE FUNCTION public.touch_market_metadata_updated_at();

RAISE NOTICE 'Section 6: market_metadata table, RLS, and trigger created.';


-- =============================================================================
-- SECTION 7: Landlord RLS on events
-- Landlords can SELECT events scheduled at their properties.
-- Currently, the events RLS grants public SELECT on published events only.
-- A landlord needs to see events at their property regardless of publish status
-- (e.g., to see a draft market day being planned at their venue).
-- =============================================================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Landlords can view events at their properties" ON public.events;

  CREATE POLICY "Landlords can view events at their properties"
    ON public.events FOR SELECT
    USING (
      property_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id       = events.property_id
          AND p.owner_id = auth.uid()
      )
    );

  RAISE NOTICE 'Section 7: Landlord event visibility policy created.';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 7: Could not create landlord events policy: %', SQLERRM;
END $$;


-- =============================================================================
-- SECTION 8: Backfill — legacy market_days without event_id
-- For market_days that existed before migration 031, no events record was created.
-- The trigger in 031 only fires on future UPDATE OF is_published transitions.
-- This backfill creates events records for all published market_days
-- that have no event_id, then links them back.
-- Wrapped in a loop so each row gets its own INSERT/UPDATE pair.
-- Safe to re-run: DO block checks event_id IS NULL before acting.
-- =============================================================================

DO $$
DECLARE
  rec         RECORD;
  new_event_id UUID;
  host_id      UUID;
BEGIN
  -- Find a platform host (founder or admin) to assign as organiser
  SELECT id INTO host_id
  FROM public.users
  WHERE role IN ('founder', 'superadmin', 'super_user', 'admin')
  ORDER BY created_at
  LIMIT 1;

  -- Process each published market_day without an event_id
  FOR rec IN
    SELECT *
    FROM public.market_days
    WHERE is_published = TRUE
      AND event_id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.events (
        title,
        description,
        start_at,
        end_at,
        host_type,
        host_id,
        venue_type,
        venue_id,
        property_id,
        venue_name,
        event_type,
        status,
        created_at,
        updated_at
      )
      VALUES (
        'Sunday Market — ' || TO_CHAR(rec.market_date, 'DD Mon YYYY'),
        NULL,
        (rec.market_date + COALESCE(rec.start_time, '08:00'::TIME))::TIMESTAMPTZ,
        (rec.market_date + COALESCE(rec.end_time,   '14:00'::TIME))::TIMESTAMPTZ,
        'user',
        host_id,
        CASE WHEN rec.property_id IS NOT NULL THEN 'property' ELSE 'custom' END,
        rec.property_id::TEXT,
        rec.property_id,
        COALESCE(rec.location_name, 'Sunday Market'),   -- freeform fallback
        'market',
        'published',
        NOW(),
        NOW()
      )
      RETURNING id INTO new_event_id;

      -- Link the new event back to the market_day
      UPDATE public.market_days
      SET event_id   = new_event_id,
          updated_at = NOW()
      WHERE id = rec.id;

      -- Create market_metadata row for this event
      INSERT INTO public.market_metadata (event_id, market_day_id, created_at, updated_at)
      VALUES (new_event_id, rec.id, NOW(), NOW())
      ON CONFLICT (event_id) DO NOTHING;

      RAISE NOTICE 'Section 8: Backfilled events record % for market_day %', new_event_id, rec.id;

    EXCEPTION WHEN others THEN
      RAISE WARNING 'Section 8: Failed to backfill market_day %: %', rec.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Section 8: market_days backfill complete.';
END $$;


-- =============================================================================
-- VERIFICATION QUERIES (run manually after applying)
-- =============================================================================
/*
  -- 1. properties.created_by
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'properties'
    AND column_name IN ('created_by', 'archived_at', 'archived_by');
  -- Expected: 3 rows, all nullable

  -- 2. vendors changes
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'vendors'
    AND column_name IN ('user_id', 'is_claimed');
  -- Expected: user_id nullable, is_claimed NOT NULL DEFAULT false

  -- 3. vendors FK is SET NULL
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.vendors'::regclass AND contype = 'f'
    AND conname = 'vendors_user_id_set_null_fkey';
  -- Expected: 1 row, ON DELETE SET NULL

  -- 4. events.venue_name
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events'
    AND column_name = 'venue_name';
  -- Expected: 1 row

  -- 5. market_metadata table exists with correct columns
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'market_metadata'
  ORDER BY ordinal_position;
  -- Expected: event_id, market_day_id, theme, expected_stalls, featured_vendor_ids, organiser_notes, created_at, updated_at

  -- 6. RLS on market_metadata
  SELECT policyname, cmd FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'market_metadata';
  -- Expected: 2 rows (SELECT public, ALL admin)

  -- 7. Landlord policy on events
  SELECT policyname FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'events'
    AND policyname = 'Landlords can view events at their properties';
  -- Expected: 1 row

  -- 8. Backfill result — no published market_days should have NULL event_id
  SELECT COUNT(*) FROM public.market_days
  WHERE is_published = TRUE AND event_id IS NULL;
  -- Expected: 0

  -- 9. Confirm market_metadata rows created for backfilled market_days
  SELECT COUNT(*) FROM public.market_metadata;
  -- Expected: >= count of published market_days that had no event_id before

  -- 10. Trigger exists for property archive audit
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table = 'properties'
    AND trigger_name = 'trigger_stamp_property_archive';
  -- Expected: 1 row
*/


-- =============================================================================
-- ROLLBACK SCRIPT (run manually in Supabase SQL editor to undo)
-- =============================================================================
/*
BEGIN;

  -- Section 8: Remove backfilled events (market_days event_id links and events rows)
  -- WARNING: Only safe if no production RSVPs have been created against these events.
  -- Identify backfilled events first:
  --   SELECT e.id FROM public.events e
  --   JOIN public.market_days md ON md.event_id = e.id
  --   WHERE e.event_type = 'market' AND e.created_at >= '<migration_run_timestamp>';
  -- Then: DELETE FROM public.events WHERE id IN (...);
  -- And:  UPDATE public.market_days SET event_id = NULL WHERE ...;

  -- Section 7
  DROP POLICY IF EXISTS "Landlords can view events at their properties" ON public.events;

  -- Section 6
  DROP TRIGGER IF EXISTS update_market_metadata_updated_at ON public.market_metadata;
  DROP FUNCTION IF EXISTS public.touch_market_metadata_updated_at();
  DROP TABLE IF EXISTS public.market_metadata;

  -- Section 5
  ALTER TABLE public.events DROP COLUMN IF EXISTS venue_name;

  -- Section 4
  ALTER TABLE public.vendors DROP COLUMN IF EXISTS is_claimed;

  -- Section 3: Restore CASCADE FK on vendors.user_id
  ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_set_null_fkey;
  ALTER TABLE public.vendors
    ADD CONSTRAINT vendors_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- Section 2
  DROP TRIGGER IF EXISTS trigger_stamp_property_archive ON public.properties;
  DROP FUNCTION IF EXISTS public.stamp_property_archive();
  ALTER TABLE public.properties
    DROP COLUMN IF EXISTS archived_at,
    DROP COLUMN IF EXISTS archived_by;

  -- Section 1
  ALTER TABLE public.properties DROP COLUMN IF EXISTS created_by;

COMMIT;
*/
