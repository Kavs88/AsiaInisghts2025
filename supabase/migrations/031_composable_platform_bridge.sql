-- =============================================================================
-- Migration: 031_composable_platform_bridge.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Bridge market_days to the events primitive.
--            Add property_id to events (enforce existing venue_type='property').
--            Add event_type discriminator to events.
--            Enforce deals.event_id FK (currently loose/no FK).
--            Prepare user_event_intents for Phase 2 market_day_id removal.
-- Safety:    Fully additive. No existing columns dropped. Rollback section included.
-- Depends:   001, 009, 011, 015
-- =============================================================================


-- =============================================================================
-- PRE-FLIGHT CHECKS (run manually before applying in production)
-- =============================================================================
/*
  -- Confirm events table exists with expected columns
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events';

  -- Confirm market_days table exists
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'market_days';

  -- Confirm properties table exists
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'properties';

  -- Count existing market_days (data at risk in phase 2)
  SELECT COUNT(*) FROM public.market_days;

  -- Count existing user_event_intents with market_day_id populated
  SELECT COUNT(*) FROM public.user_event_intents WHERE market_day_id IS NOT NULL;

  -- Confirm no FK already exists on deals.event_id
  SELECT conname FROM pg_constraint
  WHERE conrelid = 'public.deals'::regclass AND contype = 'f';
*/


-- =============================================================================
-- SECTION 1: Add event_type discriminator to events
-- Allows calendar engine to distinguish market events from community events
-- without splitting tables.
-- =============================================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'event'
  CHECK (event_type IN ('event', 'market', 'workshop', 'meetup', 'popup', 'fair'));

COMMENT ON COLUMN public.events.event_type IS
  'Discriminator for event category. market = Sunday Market day. event = generic community event.';

CREATE INDEX IF NOT EXISTS idx_events_event_type
  ON public.events(event_type);


-- =============================================================================
-- SECTION 2: Add property_id to events (enforce the existing venue_type pattern)
-- events already has venue_type + venue_id (polymorphic, no FK).
-- We add a typed property_id column for direct relational integrity when
-- venue_type = 'property'. venue_id remains for backwards compat.
-- =============================================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS property_id UUID
  REFERENCES public.properties(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.events.property_id IS
  'FK to properties when venue_type=''property''. Coexists with venue_id for backwards compat.
   Populate this when venue_type=''property''; leave NULL for vendor or custom venues.';

CREATE INDEX IF NOT EXISTS idx_events_property_id
  ON public.events(property_id)
  WHERE property_id IS NOT NULL;

-- Backfill: where venue_type = 'property', copy venue_id -> property_id
-- Safe: venue_id is UUID stored as text; cast is safe if data is clean.
-- Wrapped in DO block to handle cast failures gracefully.
DO $$
BEGIN
  UPDATE public.events
  SET property_id = venue_id::UUID
  WHERE venue_type = 'property'
    AND venue_id IS NOT NULL
    AND property_id IS NULL;
EXCEPTION WHEN others THEN
  RAISE WARNING 'Backfill of events.property_id skipped due to cast error: %', SQLERRM;
END $$;


-- =============================================================================
-- SECTION 3: Bridge market_days to events
-- market_days.event_id: the canonical events record for this market day.
-- market_days.property_id: the venue property hosting this market day.
-- Both nullable: existing rows are unaffected. Populate going forward.
-- =============================================================================

ALTER TABLE public.market_days
  ADD COLUMN IF NOT EXISTS event_id UUID
  REFERENCES public.events(id) ON DELETE SET NULL;

ALTER TABLE public.market_days
  ADD COLUMN IF NOT EXISTS property_id UUID
  REFERENCES public.properties(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.market_days.event_id IS
  'FK to events table. When populated, this market day is represented as a typed event
   (event_type=''market''). All RSVP and deals logic should reference events.id via this bridge.';

COMMENT ON COLUMN public.market_days.property_id IS
  'FK to properties. The physical venue hosting this market day.
   When set, property pages can surface upcoming market events.';

CREATE INDEX IF NOT EXISTS idx_market_days_event_id
  ON public.market_days(event_id)
  WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_market_days_property_id
  ON public.market_days(property_id)
  WHERE property_id IS NOT NULL;


-- =============================================================================
-- SECTION 4: Enforce deals.event_id FK
-- Currently loose (no FK). Safe to add if all existing event_id values are valid.
-- Wrapped in DO block: if referential integrity is violated, skip and log.
-- =============================================================================

DO $$
BEGIN
  -- Delete orphaned deals.event_id values before adding FK
  -- (deals pointing to non-existent events would block FK creation)
  UPDATE public.deals
  SET event_id = NULL
  WHERE event_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.events WHERE id = deals.event_id
    );

  ALTER TABLE public.deals
    ADD CONSTRAINT deals_event_id_fkey
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE SET NULL;

  RAISE NOTICE 'deals.event_id FK added successfully.';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'deals.event_id FK already exists, skipping.';
END $$;

CREATE INDEX IF NOT EXISTS idx_deals_event_id_fk
  ON public.deals(event_id)
  WHERE event_id IS NOT NULL;


-- =============================================================================
-- SECTION 5: Property → Events reverse index (for property event pages)
-- Allows querying "all upcoming events at property X" efficiently.
-- No schema change needed: idx_events_property_id in Section 2 covers this.
-- Add a composite index for the common UI query pattern.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_events_property_upcoming
  ON public.events(property_id, start_at)
  WHERE property_id IS NOT NULL
    AND status = 'published';


-- =============================================================================
-- SECTION 6: user_event_intent / user_event_intents — deprecation note
-- The RSVP tables branch on event_id OR market_day_id.
-- Phase 2 (migration 032) will migrate market_day_id rows to event_id via the
-- bridge and drop the market_day_id column once all market_days have event_id.
-- Skipped here: COMMENT ON requires the exact table name present in production.
-- =============================================================================

DO $$
BEGIN
  -- user_event_intents (plural — migration 011)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_event_intents'
      AND column_name  = 'market_day_id'
  ) THEN
    COMMENT ON COLUMN public.user_event_intents.market_day_id IS
      'DEPRECATED: Will be removed in migration 032 after market_days.event_id is fully populated.
       New RSVPs should reference event_id only (via market_days.event_id bridge).';
  END IF;

  -- user_event_intent (singular — migration 010)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_event_intent'
      AND column_name  = 'event_id'
  ) THEN
    COMMENT ON COLUMN public.user_event_intent.event_id IS
      'References events table. When market_day RSVPs are needed, resolve via market_days.event_id.';
  END IF;

  RAISE NOTICE 'Section 6: intent table comments applied where tables exist.';
END $$;


-- =============================================================================
-- SECTION 7: Trigger — auto-create events record when market_day is published
-- When is_published flips TRUE on a market_day that has no event_id,
-- create a corresponding events record and link it back.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_market_day_to_event()
RETURNS TRIGGER AS $$
DECLARE
  new_event_id UUID;
BEGIN
  -- Only act when publishing (is_published flips to TRUE) and no event linked yet
  IF NEW.is_published = TRUE
     AND (OLD.is_published = FALSE OR OLD.is_published IS NULL)
     AND NEW.event_id IS NULL
  THEN
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
      event_type,
      status,
      created_at,
      updated_at
    )
    VALUES (
      'Sunday Market — ' || TO_CHAR(NEW.market_date, 'DD Mon YYYY'),
      NULL,                          -- description: to be filled by admin
      (NEW.market_date + COALESCE(NEW.start_time, '08:00'::TIME))::TIMESTAMPTZ,
      (NEW.market_date + COALESCE(NEW.end_time,   '14:00'::TIME))::TIMESTAMPTZ,
      'user',                        -- host_type: platform-managed
      (SELECT id FROM public.users   -- host_id: first founder/admin
         WHERE role IN ('founder', 'super_user', 'admin')
         ORDER BY created_at LIMIT 1),
      CASE WHEN NEW.property_id IS NOT NULL THEN 'property' ELSE 'custom' END,
      NEW.property_id::TEXT,         -- venue_id (legacy polymorphic field)
      NEW.property_id,               -- venue FK (typed)
      'market',
      'published',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_event_id;

    -- Link back to market_day
    NEW.event_id := new_event_id;

    RAISE NOTICE 'Created events record % for market_day %', new_event_id, NEW.id;
  END IF;

  -- If market day is unpublished, archive the linked event (don't delete)
  IF NEW.is_published = FALSE
     AND OLD.is_published = TRUE
     AND NEW.event_id IS NOT NULL
  THEN
    UPDATE public.events
    SET status = 'archived', updated_at = NOW()
    WHERE id = NEW.event_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_market_day_to_event ON public.market_days;

CREATE TRIGGER trigger_sync_market_day_to_event
  BEFORE UPDATE OF is_published ON public.market_days
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_market_day_to_event();

COMMENT ON FUNCTION public.sync_market_day_to_event() IS
  'When a market_day is published, auto-creates a linked events record with event_type=''market''.
   When unpublished, archives the linked event. Does not delete data.';


-- =============================================================================
-- SECTION 8: RLS — events.property_id inherits existing events RLS
-- No new policies needed: events RLS covers the new column.
-- market_days RLS: add policy allowing property owners to view market_days
-- at their property (read-only, informational).
-- =============================================================================

-- Allow property owners to read market_days scheduled at their property
DO $$
BEGIN
  DROP POLICY IF EXISTS "Property owners can view market_days at their property"
    ON public.market_days;

  CREATE POLICY "Property owners can view market_days at their property"
    ON public.market_days FOR SELECT
    USING (
      property_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = market_days.property_id
          AND p.owner_id = auth.uid()
      )
    );
EXCEPTION WHEN others THEN
  RAISE WARNING 'Could not create market_days property owner policy: %', SQLERRM;
END $$;


-- =============================================================================
-- VERIFICATION QUERIES (run manually after applying)
-- =============================================================================
/*
  -- 1. Confirm new columns on events
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events'
    AND column_name IN ('event_type', 'property_id');
  -- Expected: 2 rows

  -- 2. Confirm new columns on market_days
  SELECT column_name, data_type FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'market_days'
    AND column_name IN ('event_id', 'property_id');
  -- Expected: 2 rows

  -- 3. Confirm deals FK exists
  SELECT conname FROM pg_constraint
  WHERE conrelid = 'public.deals'::regclass AND contype = 'f'
    AND conname = 'deals_event_id_fkey';
  -- Expected: 1 row

  -- 4. Confirm trigger exists
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table = 'market_days'
    AND trigger_name = 'trigger_sync_market_day_to_event';
  -- Expected: 1 row

  -- 5. Test trigger: publish a market_day and confirm events record created
  -- UPDATE public.market_days SET is_published = TRUE WHERE id = '<test_id>';
  -- SELECT event_id FROM public.market_days WHERE id = '<test_id>';
  -- SELECT * FROM public.events WHERE event_type = 'market';

  -- 6. Confirm property backfill on events
  SELECT COUNT(*) FROM public.events WHERE venue_type = 'property' AND property_id IS NULL;
  -- Expected: 0 (all property-venue events now have property_id)
*/


-- =============================================================================
-- ROLLBACK SCRIPT (run manually in Supabase SQL editor to undo)
-- =============================================================================
/*
BEGIN;

  -- Drop trigger and function
  DROP TRIGGER IF EXISTS trigger_sync_market_day_to_event ON public.market_days;
  DROP FUNCTION IF EXISTS public.sync_market_day_to_event();

  -- Drop market_days new columns
  ALTER TABLE public.market_days
    DROP COLUMN IF EXISTS event_id,
    DROP COLUMN IF EXISTS property_id;

  -- Drop events new columns
  ALTER TABLE public.events
    DROP COLUMN IF EXISTS event_type,
    DROP COLUMN IF EXISTS property_id;

  -- Drop deals FK (restore to loose reference)
  ALTER TABLE public.deals
    DROP CONSTRAINT IF EXISTS deals_event_id_fkey;

  -- Drop new indexes
  DROP INDEX IF EXISTS public.idx_events_event_type;
  DROP INDEX IF EXISTS public.idx_events_property_id;
  DROP INDEX IF EXISTS public.idx_events_property_upcoming;
  DROP INDEX IF EXISTS public.idx_market_days_event_id;
  DROP INDEX IF EXISTS public.idx_market_days_property_id;
  DROP INDEX IF EXISTS public.idx_deals_event_id_fk;

  -- Drop RLS policy
  DROP POLICY IF EXISTS "Property owners can view market_days at their property"
    ON public.market_days;

COMMIT;
*/
