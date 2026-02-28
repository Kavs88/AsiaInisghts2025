-- =============================================================================
-- Migration: 034_critical_hardening.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Critical production hardening.
--
--   Section 1:  Replace blanket events RLS from migration 009
--   Section 2:  events.organizer_id FK — CASCADE → SET NULL
--   Section 3:  events.status CHECK — extend to include 'cancelled'
--   Section 4:  events cancellation audit columns
--   Section 5:  Fix sync_market_day_to_event trigger — draft not archived on unpublish
--
-- Safety:    Fully idempotent. No data deleted. Rollback section included.
-- Depends:   006, 009, 031, 033
-- =============================================================================


-- =============================================================================
-- PRE-FLIGHT CHECKS (run manually before applying in production)
-- =============================================================================
/*
  -- 1. Confirm current events SELECT policies
  SELECT policyname, cmd, qual
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'events'
  ORDER BY cmd, policyname;

  -- 2. Confirm current events.organizer_id FK (if column exists)
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass AND contype = 'f';

  -- 3. Confirm current events.status CHECK
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass AND contype = 'c'
    AND conname LIKE '%status%';

  -- 4. Confirm trigger exists from 031
  SELECT trigger_name, event_manipulation, action_statement
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
    AND event_object_table  = 'market_days'
    AND trigger_name        = 'trigger_sync_market_day_to_event';

  -- 5. Count events currently set to 'archived' via the 031 trigger
  --    (these were market_day unpublish events — may need manual review)
  SELECT COUNT(*) FROM public.events
  WHERE event_type = 'market' AND status = 'archived';
*/


-- =============================================================================
-- SECTION 1: Replace blanket events RLS from migration 009
--
-- Migration 009 installed:
--   "Enable read access for all users" — USING (true)
--   "Enable write access for admins and owners" — USING (auth.role() = 'authenticated')
--
-- The SELECT policy exposes draft events to all anonymous users.
-- We replace it with a status-scoped public policy.
--
-- The landlord visibility policy installed in migration 033 Section 7
-- ("Landlords can view events at their properties") is preserved — not touched here.
--
-- The write policy ("Enable write access for admins and owners") is not touched
-- in this migration. It is overly permissive but scoped to authenticated users only;
-- tightening it requires a separate audit of all write paths.
-- =============================================================================

DO $$
BEGIN
  -- Drop the blanket read policy from migration 009
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
  RAISE NOTICE 'Section 1: Dropped blanket SELECT policy "Enable read access for all users".';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 1: Could not drop blanket SELECT policy: %', SQLERRM;
END $$;

-- Recreate as a status-scoped public policy
-- Anonymous and authenticated users may only read published events.
-- Landlords receive additional visibility via the 033 Section 7 policy (untouched).
DO $$
BEGIN
  DROP POLICY IF EXISTS "Published events are publicly readable" ON public.events;

  CREATE POLICY "Published events are publicly readable"
    ON public.events FOR SELECT
    USING (status = 'published');

  RAISE NOTICE 'Section 1: Created "Published events are publicly readable" SELECT policy.';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 1: Could not create replacement SELECT policy: %', SQLERRM;
END $$;


-- =============================================================================
-- SECTION 2: events.organizer_id FK — ON DELETE CASCADE → ON DELETE SET NULL
--
-- Migration 006 created events with:
--   organizer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
--
-- ON DELETE CASCADE destroys events (and all linked RSVPs, market_metadata,
-- deals) when a user account is deleted. This must be SET NULL.
--
-- Wrapped in DO block: safe no-op if column does not exist (009-schema events
-- table has host_id/host_type instead of organizer_id).
-- =============================================================================

DO $$
DECLARE
  fk_name   TEXT;
  col_exists BOOLEAN;
BEGIN
  -- Check if organizer_id column exists on events
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'events'
      AND column_name  = 'organizer_id'
  ) INTO col_exists;

  IF NOT col_exists THEN
    RAISE NOTICE 'Section 2: events.organizer_id column not found — skipping FK fix (009-schema table in use).';
    RETURN;
  END IF;

  -- Find existing FK constraint on organizer_id
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass
    AND contype  = 'f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.events'::regclass
         AND attname  = 'organizer_id')::smallint
    ];

  -- Drop existing FK (any name) if it is CASCADE
  IF fk_name IS NOT NULL AND fk_name != 'events_organizer_id_set_null_fkey' THEN
    EXECUTE format('ALTER TABLE public.events DROP CONSTRAINT %I', fk_name);
    RAISE NOTICE 'Section 2: Dropped FK % on events.organizer_id.', fk_name;
  END IF;

  -- Allow organizer_id to be nullable before adding SET NULL FK
  ALTER TABLE public.events ALTER COLUMN organizer_id DROP NOT NULL;

  -- Recreate FK with ON DELETE SET NULL
  ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS events_organizer_id_set_null_fkey;

  ALTER TABLE public.events
    ADD CONSTRAINT events_organizer_id_set_null_fkey
    FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE SET NULL;

  COMMENT ON COLUMN public.events.organizer_id IS
    'FK to users. Nullable. ON DELETE SET NULL — deleting a user account does not delete their events.';

  RAISE NOTICE 'Section 2: events.organizer_id FK set to ON DELETE SET NULL.';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 2: Could not fix organizer_id FK: %', SQLERRM;
END $$;


-- =============================================================================
-- SECTION 3: Extend events.status CHECK to include 'cancelled'
--
-- Current constraint (from migration 009):
--   CHECK (status IN ('draft', 'published', 'archived'))
--
-- Extended to:
--   CHECK (status IN ('draft', 'published', 'cancelled', 'archived'))
--
-- Default remains 'draft'.
--
-- Strategy:
--   Drop the existing CHECK constraint by its auto-generated name.
--   PostgreSQL names inline column CHECK constraints as {table}_{column}_check.
--   Also attempt known variant names defensively.
-- =============================================================================

DO $$
BEGIN
  ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
  ALTER TABLE public.events DROP CONSTRAINT IF EXISTS chk_events_status;

  ALTER TABLE public.events
    ADD CONSTRAINT events_status_check
    CHECK (status IN ('draft', 'published', 'cancelled', 'archived'));

  RAISE NOTICE 'Section 3: events.status CHECK extended to include ''cancelled''.';
EXCEPTION WHEN others THEN
  RAISE EXCEPTION 'Section 3 failed: %', SQLERRM;
END $$;

COMMENT ON COLUMN public.events.status IS
  'Event lifecycle state.
   draft     = created, not yet visible to public.
   published = live, visible to public, accepting RSVPs.
   cancelled = was published; event will not occur. Visible with cancelled indicator.
   archived  = terminal state. Hidden from all public surfaces. Admin-only.
   Allowed transitions: draft→published, published→cancelled, published→archived,
   cancelled→archived, draft→archived. NEVER: published→draft, archived→any.';


-- =============================================================================
-- SECTION 4: Cancellation audit columns
--
-- Additive. All nullable — no triggers. Server actions populate these
-- fields in the same UPDATE payload that sets status = ''cancelled''.
-- =============================================================================

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cancelled_at       TIMESTAMPTZ;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cancelled_by       UUID
  REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

COMMENT ON COLUMN public.events.cancelled_at IS
  'Timestamp when this event was cancelled. NULL = not cancelled. Set by server action.';

COMMENT ON COLUMN public.events.cancelled_by IS
  'User who performed the cancellation. FK to users ON DELETE SET NULL.';

COMMENT ON COLUMN public.events.cancellation_reason IS
  'Human-readable reason for cancellation. Surfaced to attendees.';



-- =============================================================================
-- SECTION 5: Fix sync_market_day_to_event trigger
--
-- Migration 031 installed this trigger. When a market_day is unpublished,
-- it sets the linked event to status = ''archived''.
--
-- This is incorrect. Unpublishing a market day is a reversible editorial action.
-- The event must return to ''draft'', not ''archived''.
-- ''archived'' is a terminal state; ''draft'' allows republishing.
--
-- We replace the function body only. The trigger binding itself is unchanged.
-- All other trigger behaviour (auto-create on publish, SECURITY DEFINER) is preserved.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_market_day_to_event()
RETURNS TRIGGER AS $$
DECLARE
  new_event_id UUID;
BEGIN

  -- -------------------------------------------------------------------------
  -- PUBLISH: market_day is being published with no linked event.
  -- Create an events record with event_type = 'market' and link it back.
  -- -------------------------------------------------------------------------
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
      NULL,
      (NEW.market_date + COALESCE(NEW.start_time, '08:00'::TIME))::TIMESTAMPTZ,
      (NEW.market_date + COALESCE(NEW.end_time,   '14:00'::TIME))::TIMESTAMPTZ,
      'user',
      (SELECT id FROM public.users
         WHERE role IN ('founder', 'super_user', 'admin')
         ORDER BY created_at
         LIMIT 1),
      CASE WHEN NEW.property_id IS NOT NULL THEN 'property' ELSE 'custom' END,
      NEW.property_id::TEXT,
      NEW.property_id,
      'market',
      'published',
      NOW(),
      NOW()
    )
    RETURNING id INTO new_event_id;

    NEW.event_id := new_event_id;

    RAISE NOTICE 'sync_market_day_to_event: Created events record % for market_day %',
      new_event_id, NEW.id;
  END IF;

  -- -------------------------------------------------------------------------
  -- UNPUBLISH: market_day is being unpublished with a linked event.
  -- Set the event to 'draft' — NOT 'archived'.
  -- Unpublishing is a reversible editorial action. The market day may be
  -- rescheduled and republished. 'archived' is terminal; 'draft' is not.
  -- -------------------------------------------------------------------------
  IF NEW.is_published = FALSE
     AND OLD.is_published = TRUE
     AND NEW.event_id IS NOT NULL
  THEN
    UPDATE public.events
    SET status     = 'draft',   -- corrected from 'archived' (migration 031)
        updated_at = NOW()
    WHERE id = NEW.event_id;

    RAISE NOTICE 'sync_market_day_to_event: Set event % to draft for unpublished market_day %',
      NEW.event_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.sync_market_day_to_event() IS
  'Syncs market_days publish state to the linked events record.
   Publish  → creates event with event_type=''market'', status=''published''.
   Unpublish → sets event status=''draft'' (reversible; was ''archived'' in 031 — corrected here).
   Permanent cancellation of a market must be handled via the cancelEvent server action,
   not by toggling is_published.';



-- =============================================================================
-- POST-APPLY: Remediate existing 'archived' market events set by 031 trigger
--
-- Any market events that were set to 'archived' by the old 031 trigger
-- when a market_day was unpublished should be reviewed.
-- They may have been incorrectly archived when they should be 'draft'.
--
-- Run the following query MANUALLY to identify candidates before deciding:
-- =============================================================================
/*
  -- Identify market events that were archived via the old trigger behaviour.
  -- These are events where the linked market_day is currently unpublished
  -- (suggesting the archive was triggered by an unpublish action, not an admin archive).
  SELECT
    e.id          AS event_id,
    e.title,
    e.status,
    e.updated_at,
    md.id         AS market_day_id,
    md.market_date,
    md.is_published
  FROM public.events e
  JOIN public.market_days md ON md.event_id = e.id
  WHERE e.event_type   = 'market'
    AND e.status       = 'archived'
    AND md.is_published = FALSE
  ORDER BY md.market_date DESC;

  -- If the above returns rows that should be 'draft' (unpublished but not permanently archived),
  -- run the following to remediate:
  UPDATE public.events e
  SET status = 'draft', updated_at = NOW()
  FROM public.market_days md
  WHERE md.event_id     = e.id
    AND e.event_type    = 'market'
    AND e.status        = 'archived'
    AND md.is_published = FALSE;
*/


-- =============================================================================
-- VERIFICATION QUERIES (run manually after applying)
-- =============================================================================
/*
  -- 1. Confirm blanket policy is gone, replacement is in place
  SELECT policyname, cmd, qual
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'events'
  ORDER BY cmd, policyname;
  -- Expected: no "Enable read access for all users"
  -- Expected: "Published events are publicly readable" with qual = (status = 'published')
  -- Expected: "Landlords can view events at their properties" still present (from 033)

  -- 2. Confirm organizer_id FK (if column exists)
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass AND contype = 'f'
    AND conname  = 'events_organizer_id_set_null_fkey';
  -- Expected: 1 row, ON DELETE SET NULL

  -- 3. Confirm status CHECK includes 'cancelled'
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.events'::regclass AND contype = 'c'
    AND conname  = 'events_status_check';
  -- Expected: CHECK ((status = ANY (ARRAY['draft', 'published', 'cancelled', 'archived'])))

  -- 4. Confirm cancellation audit columns
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'events'
    AND column_name IN ('cancelled_at', 'cancelled_by', 'cancellation_reason')
  ORDER BY column_name;
  -- Expected: 3 rows, all nullable

  -- 5. Confirm trigger function body references 'draft' not 'archived' on unpublish
  SELECT prosrc FROM pg_proc
  WHERE proname = 'sync_market_day_to_event';
  -- Expected: function body contains "status = 'draft'" in the unpublish branch
  -- Expected: function body does NOT contain "status = 'archived'"

  -- 6. Smoke test status CHECK — these should succeed:
  --   INSERT INTO public.events (..., status) VALUES (..., 'cancelled');  → OK
  -- This should fail:
  --   INSERT INTO public.events (..., status) VALUES (..., 'suspended'); → ERROR
*/


-- =============================================================================
-- ROLLBACK SCRIPT (run manually in Supabase SQL editor to undo)
-- =============================================================================
/*
BEGIN;

  -- Section 5: Restore original trigger function (archived on unpublish)
  CREATE OR REPLACE FUNCTION public.sync_market_day_to_event()
  RETURNS TRIGGER AS $fn$
  DECLARE
    new_event_id UUID;
  BEGIN
    IF NEW.is_published = TRUE
       AND (OLD.is_published = FALSE OR OLD.is_published IS NULL)
       AND NEW.event_id IS NULL
    THEN
      INSERT INTO public.events (
        title, description, start_at, end_at,
        host_type, host_id, venue_type, venue_id,
        property_id, event_type, status, created_at, updated_at
      )
      VALUES (
        'Sunday Market — ' || TO_CHAR(NEW.market_date, 'DD Mon YYYY'),
        NULL,
        (NEW.market_date + COALESCE(NEW.start_time, '08:00'::TIME))::TIMESTAMPTZ,
        (NEW.market_date + COALESCE(NEW.end_time,   '14:00'::TIME))::TIMESTAMPTZ,
        'user',
        (SELECT id FROM public.users
           WHERE role IN ('founder', 'super_user', 'admin')
           ORDER BY created_at LIMIT 1),
        CASE WHEN NEW.property_id IS NOT NULL THEN 'property' ELSE 'custom' END,
        NEW.property_id::TEXT,
        NEW.property_id,
        'market',
        'published',
        NOW(), NOW()
      )
      RETURNING id INTO new_event_id;
      NEW.event_id := new_event_id;
    END IF;

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
  $fn$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Section 4: Remove cancellation audit columns
  ALTER TABLE public.events
    DROP COLUMN IF EXISTS cancelled_at,
    DROP COLUMN IF EXISTS cancelled_by,
    DROP COLUMN IF EXISTS cancellation_reason;

  -- Section 3: Restore original status CHECK (without 'cancelled')
  ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
  ALTER TABLE public.events
    ADD CONSTRAINT events_status_check
    CHECK (status IN ('draft', 'published', 'archived'));

  -- Section 2: Restore organizer_id CASCADE FK (if column exists)
  -- Note: also restores NOT NULL — will fail if any row has NULL organizer_id.
  -- Fix data first: UPDATE public.events SET organizer_id = '<admin_uuid>' WHERE organizer_id IS NULL;
  ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_organizer_id_set_null_fkey;
  -- ALTER TABLE public.events ALTER COLUMN organizer_id SET NOT NULL;
  -- ALTER TABLE public.events
  --   ADD CONSTRAINT events_organizer_id_fkey
  --   FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- Section 1: Restore blanket SELECT policy from migration 009
  DROP POLICY IF EXISTS "Published events are publicly readable" ON public.events;
  CREATE POLICY "Enable read access for all users" ON public.events
    FOR SELECT USING (true);

COMMIT;
*/
