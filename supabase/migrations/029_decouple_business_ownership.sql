-- =============================================================================
-- Migration: 029_decouple_business_ownership.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Decouple business ownership from auth identity.
--            Introduce created_by audit field. Nullify Madam Lan's owner_id.
--            Remove auto-assignment triggers. Enforce strict role-based RLS.
-- Safety:    Idempotent. Includes rollback section at end of file.
-- =============================================================================

-- =============================================================================
-- PRE-FLIGHT VALIDATION
-- Run these manually before applying in production:
--
--   SELECT id FROM public.users WHERE id = auth.uid(); -- must return 1 row
--   SELECT role FROM public.users LIMIT 5;             -- confirm role column exists
--   SELECT conname FROM pg_constraint
--     WHERE conrelid = 'public.businesses'::regclass
--     AND contype = 'f' AND conkey @> ARRAY[
--       (SELECT attnum FROM pg_attribute
--        WHERE attrelid='public.businesses'::regclass AND attname='owner_id')
--     ];                                               -- inspect FK name
-- =============================================================================


-- =============================================================================
-- SECTION 1: Extend role CHECK constraint to include 'superadmin' and 'founder'
-- =============================================================================

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'vendor', 'admin', 'super_user', 'superadmin', 'founder'));


-- =============================================================================
-- SECTION 2: Schema Enhancements — businesses
-- =============================================================================

-- created_by: audit origin (who submitted this record)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- is_claimed: owner has manually asserted ownership
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN NOT NULL DEFAULT false;

-- is_verified: platform-verified record (already exists in 006 schema, idempotent)
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Drop NOT NULL constraint on owner_id (businesses were created with NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'businesses'
      AND column_name  = 'owner_id'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE public.businesses ALTER COLUMN owner_id DROP NOT NULL;
  END IF;
END $$;

-- Drop auto-assignment DEFAULT on owner_id
ALTER TABLE public.businesses ALTER COLUMN owner_id DROP DEFAULT;

-- Fix FK: change ON DELETE CASCADE → ON DELETE SET NULL
-- (Prevents accidental business deletion when a user account is removed)
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.businesses'::regclass
    AND contype  = 'f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.businesses'::regclass AND attname = 'owner_id')::smallint
    ];

  IF fk_name IS NOT NULL AND fk_name != 'businesses_owner_id_set_null_fkey' THEN
    EXECUTE format('ALTER TABLE public.businesses DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_owner_id_set_null_fkey;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_owner_id_set_null_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Index for created_by lookups
CREATE INDEX IF NOT EXISTS idx_businesses_created_by ON public.businesses(created_by);
CREATE INDEX IF NOT EXISTS idx_businesses_is_claimed  ON public.businesses(is_claimed);


-- =============================================================================
-- SECTION 3: Schema Enhancements — entities
-- =============================================================================

-- entities.owner_id is already nullable (ON DELETE SET NULL) from migration 017.
-- Add audit and claim fields.

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS is_claimed  BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.entities
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

-- Drop DEFAULT on owner_id if one exists
ALTER TABLE public.entities ALTER COLUMN owner_id DROP DEFAULT;

CREATE INDEX IF NOT EXISTS idx_entities_created_by ON public.entities(created_by);
CREATE INDEX IF NOT EXISTS idx_entities_is_claimed  ON public.entities(is_claimed);


-- =============================================================================
-- SECTION 4: Immediate Data Correction
-- =============================================================================

UPDATE public.businesses
SET owner_id = NULL
WHERE slug = 'madam-lan-seafood';

UPDATE public.entities
SET owner_id = NULL
WHERE slug = 'madam-lan-seafood';

UPDATE public.vendors
SET user_id = NULL
WHERE slug = 'madam-lan-seafood';


-- =============================================================================
-- SECTION 5: Trigger Cleanup — remove any auto-assignment of owner_id
-- =============================================================================

-- Drop any triggers that auto-set owner_id = auth.uid() on businesses
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table  = 'businesses'
      AND trigger_name NOT IN (
        'update_businesses_updated_at'   -- safe: only updates updated_at
      )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.businesses',
      trig.trigger_name
    );
  END LOOP;
END $$;

-- Drop any triggers that auto-set owner_id = auth.uid() on entities
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table  = 'entities'
      AND trigger_name NOT IN (
        'update_entities_updated_at',    -- safe
        'trigger_sync_trust_badges'      -- safe: syncs trust_badges only
      )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.entities',
      trig.trigger_name
    );
  END LOOP;
END $$;

-- Drop any triggers that auto-set user_id = auth.uid() on vendors
DO $$
DECLARE
  trig RECORD;
BEGIN
  FOR trig IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table  = 'vendors'
      AND trigger_name NOT IN (
        'update_vendors_updated_at'      -- safe
      )
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I ON public.vendors',
      trig.trigger_name
    );
  END LOOP;
END $$;


-- =============================================================================
-- SECTION 6: Enable and Force RLS
-- =============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses FORCE ROW LEVEL SECURITY;

ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities FORCE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 7: Drop ALL existing policies on businesses and entities
-- =============================================================================

-- businesses
DROP POLICY IF EXISTS "Public can view active businesses"         ON public.businesses;
DROP POLICY IF EXISTS "Owners can view own businesses"            ON public.businesses;
DROP POLICY IF EXISTS "Owners can manage own businesses"          ON public.businesses;
DROP POLICY IF EXISTS "Owners manage own business"                ON public.businesses;
DROP POLICY IF EXISTS "Admins can view all businesses"            ON public.businesses;
DROP POLICY IF EXISTS "Admins can manage all businesses"          ON public.businesses;
DROP POLICY IF EXISTS "Admins manage all businesses"              ON public.businesses;
DROP POLICY IF EXISTS "Owners update claimed businesses"          ON public.businesses;
DROP POLICY IF EXISTS "Submitters update unclaimed businesses"    ON public.businesses;
DROP POLICY IF EXISTS "Businesses are publicly viewable"          ON public.businesses;
DROP POLICY IF EXISTS "Public Read Businesses"                    ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins delete businesses"                  ON public.businesses;

-- entities
DROP POLICY IF EXISTS "Entities are publicly viewable"            ON public.entities;
DROP POLICY IF EXISTS "Owners can update their entities"          ON public.entities;
DROP POLICY IF EXISTS "Owners can manage own entities"            ON public.entities;
DROP POLICY IF EXISTS "Admins can view all entities"              ON public.entities;
DROP POLICY IF EXISTS "Admins can manage all entities"            ON public.entities;
DROP POLICY IF EXISTS "Admins manage all entities"                ON public.entities;
DROP POLICY IF EXISTS "Owners update claimed entities"            ON public.entities;
DROP POLICY IF EXISTS "Submitters update unclaimed entities"      ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can insert entities"   ON public.entities;
DROP POLICY IF EXISTS "Admins delete entities"                    ON public.entities;


-- =============================================================================
-- SECTION 8: RLS Policies — businesses
-- Assumption: SELECT is unrestricted (public directory).
--             Adjust USING clause if you require is_verified = true for SELECT.
-- =============================================================================

-- SELECT: Public read (directory is open)
CREATE POLICY "Businesses are publicly viewable"
  ON public.businesses FOR SELECT
  USING (true);

-- INSERT: Any authenticated user may submit a business listing.
--         owner_id stays NULL; created_by = auth.uid() is set by column DEFAULT.
CREATE POLICY "Authenticated users can insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE — path A: Founder / Admin / Super (role-based, no email, no hardcoding)
CREATE POLICY "Admins manage all businesses"
  ON public.businesses FOR UPDATE
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

-- UPDATE — path B: Verified owner (owner_id matches, business is claimed)
CREATE POLICY "Owners update claimed businesses"
  ON public.businesses FOR UPDATE
  USING (
    owner_id   = auth.uid()
    AND is_claimed = true
  )
  WITH CHECK (
    owner_id   = auth.uid()
    AND is_claimed = true
  );

-- UPDATE — path C: Original submitter (unclaimed records only)
CREATE POLICY "Submitters update unclaimed businesses"
  ON public.businesses FOR UPDATE
  USING (
    created_by   = auth.uid()
    AND is_claimed = false
  )
  WITH CHECK (
    created_by   = auth.uid()
    AND is_claimed = false
  );

-- DELETE: Founder / Admin only
CREATE POLICY "Admins delete businesses"
  ON public.businesses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id   = auth.uid()
        AND role IN ('admin', 'superadmin', 'super_user', 'founder')
    )
  );


-- =============================================================================
-- SECTION 9: RLS Policies — entities
-- =============================================================================

-- SELECT: Public read
CREATE POLICY "Entities are publicly viewable"
  ON public.entities FOR SELECT
  USING (true);

-- INSERT: Authenticated users
CREATE POLICY "Authenticated users can insert entities"
  ON public.entities FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE — path A: Admin / Founder
CREATE POLICY "Admins manage all entities"
  ON public.entities FOR UPDATE
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

-- UPDATE — path B: Verified owner
CREATE POLICY "Owners update claimed entities"
  ON public.entities FOR UPDATE
  USING (
    owner_id   = auth.uid()
    AND is_claimed = true
  )
  WITH CHECK (
    owner_id   = auth.uid()
    AND is_claimed = true
  );

-- UPDATE — path C: Submitter (unclaimed)
CREATE POLICY "Submitters update unclaimed entities"
  ON public.entities FOR UPDATE
  USING (
    created_by   = auth.uid()
    AND is_claimed = false
  )
  WITH CHECK (
    created_by   = auth.uid()
    AND is_claimed = false
  );

-- DELETE: Admin / Founder only
CREATE POLICY "Admins delete entities"
  ON public.entities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id   = auth.uid()
        AND role IN ('admin', 'superadmin', 'super_user', 'founder')
    )
  );


-- =============================================================================
-- SECTION 10: Backfill created_by from existing owner_id (one-time, safe)
-- Sets created_by = owner_id for records where owner was previously auto-assigned
-- and created_by is still NULL.
-- =============================================================================

UPDATE public.businesses
SET created_by = owner_id
WHERE created_by IS NULL
  AND owner_id IS NOT NULL;

UPDATE public.entities
SET created_by = owner_id
WHERE created_by IS NULL
  AND owner_id IS NOT NULL;


-- =============================================================================
-- ROLLBACK (run manually to undo this migration)
-- =============================================================================

/*
-- ROLLBACK SCRIPT — run in Supabase SQL editor if needed

BEGIN;

-- 1. Remove new columns
ALTER TABLE public.businesses DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.businesses DROP COLUMN IF EXISTS is_claimed;

ALTER TABLE public.entities DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.entities DROP COLUMN IF EXISTS is_claimed;

-- 2. Restore NOT NULL on businesses.owner_id
--    WARNING: will fail if any row has owner_id = NULL. Fix data first.
ALTER TABLE public.businesses ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE public.businesses ALTER COLUMN owner_id SET DEFAULT auth.uid();

-- 3. Restore FK to ON DELETE CASCADE
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_set_null_fkey;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Restore Madam Lan's owner_id (replace <founder_uuid> with actual UUID)
-- UPDATE public.businesses SET owner_id = '<founder_uuid>' WHERE slug = 'madam-lan-seafood';
-- UPDATE public.entities   SET owner_id = '<founder_uuid>' WHERE slug = 'madam-lan-seafood';

-- 5. Remove role extensions
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'vendor', 'admin', 'super_user'));

-- 6. Drop new policies
DROP POLICY IF EXISTS "Businesses are publicly viewable"          ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins manage all businesses"              ON public.businesses;
DROP POLICY IF EXISTS "Owners update claimed businesses"          ON public.businesses;
DROP POLICY IF EXISTS "Submitters update unclaimed businesses"    ON public.businesses;
DROP POLICY IF EXISTS "Admins delete businesses"                  ON public.businesses;

DROP POLICY IF EXISTS "Entities are publicly viewable"            ON public.entities;
DROP POLICY IF EXISTS "Authenticated users can insert entities"   ON public.entities;
DROP POLICY IF EXISTS "Admins manage all entities"                ON public.entities;
DROP POLICY IF EXISTS "Owners update claimed entities"            ON public.entities;
DROP POLICY IF EXISTS "Submitters update unclaimed entities"      ON public.entities;
DROP POLICY IF EXISTS "Admins delete entities"                    ON public.entities;

-- 7. Restore prior policies (from 007_properties_events_businesses_rls.sql)
CREATE POLICY "Public can view active businesses" ON public.businesses
  FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Owners can manage own businesses" ON public.businesses
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Admins can manage all businesses" ON public.businesses
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Entities are publicly viewable" ON public.entities
  FOR SELECT USING (true);
CREATE POLICY "Owners can update their entities" ON public.entities
  FOR UPDATE USING (auth.uid() = owner_id);

COMMIT;
*/


-- =============================================================================
-- POST-MIGRATION VERIFICATION CHECKLIST
-- Run each query manually in Supabase SQL editor after applying this migration.
-- =============================================================================

/*
-- 1. Confirm new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('businesses', 'entities')
  AND column_name IN ('created_by', 'is_claimed', 'is_verified')
ORDER BY table_name, column_name;

-- 2. Confirm owner_id is nullable on businesses
SELECT is_nullable FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'businesses' AND column_name = 'owner_id';
-- Expected: YES

-- 3. Confirm Madam Lan's is severed
SELECT id, slug, owner_id, is_claimed FROM public.businesses WHERE slug = 'madam-lan-seafood';
SELECT id, slug, owner_id, is_claimed FROM public.entities   WHERE slug = 'madam-lan-seafood';
-- Expected: owner_id = NULL, is_claimed = false

-- 4. Confirm RLS is active
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('businesses', 'entities');
-- Expected: rowsecurity = true, forcerowsecurity = true for both

-- 5. Confirm policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('businesses', 'entities')
ORDER BY tablename, cmd;
-- Expected: SELECT, INSERT, UPDATE (x3), DELETE for each table

-- 6. Confirm no auto-owner trigger on businesses
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'businesses';
-- Should only contain: update_businesses_updated_at

-- 7. Confirm new roles exist in CHECK constraint
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'users_role_check';
-- Expected: includes 'superadmin', 'founder'

-- 8. Confirm FK is now ON DELETE SET NULL
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.businesses'::regclass AND contype = 'f'
  AND conname LIKE '%owner%';
-- Expected: businesses_owner_id_set_null_fkey ... ON DELETE SET NULL
*/
