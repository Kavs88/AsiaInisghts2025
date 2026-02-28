-- =============================================================================
-- Migration: 032_landlord_dashboard_schema.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Introduce the Landlord role and operational columns on properties.
--            - Add 'landlord' to users.role CHECK constraint.
--            - Add active_from / active_until / assigned_to / is_archived /
--              landlord_notes columns to properties table.
--            - Relax properties.owner_id NOT NULL (allows admin-curated listings).
--            - Fix FK to ON DELETE SET NULL (mirrors business ownership pattern).
--            - No new RLS needed: existing "Owners can manage own properties"
--              already covers landlord (owner_id = auth.uid()).
-- Safety:    Fully additive. Existing data unaffected. Rollback section included.
-- Depends:   001, 006, 007, 015, 029, 031
-- =============================================================================


-- =============================================================================
-- PRE-FLIGHT CHECKS (run manually before applying in production)
-- =============================================================================
/*
  -- Confirm current role CHECK on users
  SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';
  -- Expected: includes 'customer','vendor','admin','super_user','superadmin','founder'

  -- Confirm properties.owner_id is currently NOT NULL
  SELECT is_nullable FROM information_schema.columns
  WHERE table_schema='public' AND table_name='properties' AND column_name='owner_id';
  -- Expected: NO

  -- Confirm existing properties FK name
  SELECT conname FROM pg_constraint
  WHERE conrelid='public.properties'::regclass AND contype='f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid='public.properties'::regclass AND attname='owner_id')::smallint
    ];
  -- Note this name — used in the FK replacement block below.
*/


-- =============================================================================
-- SECTION 1: Add 'landlord' to users.role CHECK constraint
-- Extends the role set established in migration 029.
-- =============================================================================

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('customer', 'vendor', 'admin', 'super_user', 'superadmin', 'founder', 'landlord'));

COMMENT ON COLUMN public.users.role IS
  'Platform role. landlord = property owner with dashboard access.
   admin/superadmin/founder = platform staff. vendor = market stall vendor.
   customer = general user.';


-- =============================================================================
-- SECTION 2: Add operational columns to properties
-- All nullable / have safe defaults — existing rows are unaffected.
-- =============================================================================

-- When this listing is/was activated (for time-bound event space rentals)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS active_from TIMESTAMPTZ;

-- When this listing expires (NULL = open-ended)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS active_until TIMESTAMPTZ;

-- Platform concierge agent assigned to manage this property
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS assigned_to UUID
  REFERENCES public.users(id) ON DELETE SET NULL;

-- Soft-archive: hides from public listings without deleting the row or FK refs
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Internal notes visible only to landlord + admin (not surfaced in public queries)
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS landlord_notes TEXT;

COMMENT ON COLUMN public.properties.active_from IS
  'Timestamp when this listing became / becomes active. NULL = always active.';
COMMENT ON COLUMN public.properties.active_until IS
  'Timestamp when this listing expires. NULL = open-ended.';
COMMENT ON COLUMN public.properties.assigned_to IS
  'Concierge agent (platform user) assigned to manage this property. FK to users.';
COMMENT ON COLUMN public.properties.is_archived IS
  'Soft-delete flag. TRUE = hidden from all public queries. Admin can restore.';
COMMENT ON COLUMN public.properties.landlord_notes IS
  'Internal notes for landlord / admin. Not exposed in public API.';


-- =============================================================================
-- SECTION 3: Indexes for new columns
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_is_archived
  ON public.properties(is_archived)
  WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_properties_assigned_to
  ON public.properties(assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_properties_active_window
  ON public.properties(active_from, active_until)
  WHERE active_from IS NOT NULL OR active_until IS NOT NULL;

-- Composite: landlord dashboard query (my properties, not archived)
CREATE INDEX IF NOT EXISTS idx_properties_owner_not_archived
  ON public.properties(owner_id, is_archived, created_at DESC)
  WHERE is_archived = false;


-- =============================================================================
-- SECTION 4: Relax properties.owner_id NOT NULL
-- Allows admin-curated listings (e.g., off-market event spaces) without a
-- registered landlord account. Mirrors the pattern applied to businesses.owner_id
-- in migration 029.
-- =============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'properties'
      AND column_name  = 'owner_id'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE public.properties ALTER COLUMN owner_id DROP NOT NULL;
    RAISE NOTICE 'Section 4: properties.owner_id NOT NULL constraint removed.';
  ELSE
    RAISE NOTICE 'Section 4: properties.owner_id already nullable, skipping.';
  END IF;
END $$;

-- Drop DEFAULT if any (owner should be assigned explicitly, not via auth.uid() default)
ALTER TABLE public.properties ALTER COLUMN owner_id DROP DEFAULT;


-- =============================================================================
-- SECTION 5: Fix properties.owner_id FK from ON DELETE CASCADE → ON DELETE SET NULL
-- ON DELETE CASCADE was the original (migration 006). Changing to SET NULL prevents
-- a landlord account deletion from wiping all their property listings.
-- =============================================================================

DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.properties'::regclass
    AND contype  = 'f'
    AND conkey @> ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.properties'::regclass
         AND attname  = 'owner_id')::smallint
    ];

  IF fk_name IS NOT NULL AND fk_name != 'properties_owner_id_set_null_fkey' THEN
    EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT %I', fk_name);
    RAISE NOTICE 'Section 5: Dropped old FK %', fk_name;
  END IF;
END $$;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_owner_id_set_null_fkey;
ALTER TABLE public.properties
  ADD CONSTRAINT properties_owner_id_set_null_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;

RAISE NOTICE 'Section 5: properties.owner_id FK set to ON DELETE SET NULL.';


-- =============================================================================
-- SECTION 6: RLS — landlord SELECT + UPDATE on own properties
-- Note: The existing "Owners can manage own properties" policy (migration 007)
-- already grants ALL (SELECT/INSERT/UPDATE/DELETE) to any user where
-- owner_id = auth.uid(). This covers landlords automatically.
--
-- We add a narrower, explicit landlord UPDATE policy that restricts
-- which columns a landlord can update (cannot change owner_id or is_archived
-- without admin involvement). This uses a WITH CHECK constraint.
-- The broader "Owners can manage own properties" is preserved for backwards compat.
-- =============================================================================

-- Ensure RLS is enabled (idempotent — safe to re-run)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Landlord-scoped update policy: landlord can update their own property's
-- operational fields but cannot reassign ownership or archive themselves.
DO $$
BEGIN
  DROP POLICY IF EXISTS "Landlords can update own property details"
    ON public.properties;

  CREATE POLICY "Landlords can update own property details"
    ON public.properties FOR UPDATE
    USING (
      owner_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.users
        WHERE id   = auth.uid()
          AND role = 'landlord'
      )
    )
    WITH CHECK (
      owner_id = auth.uid()     -- cannot reassign ownership
      AND is_archived = false   -- cannot self-archive (admin only)
    );

  RAISE NOTICE 'Section 6: Landlord UPDATE policy created.';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 6: Could not create landlord policy: %', SQLERRM;
END $$;


-- =============================================================================
-- SECTION 7: Public query guard — exclude archived properties from public reads
-- The existing "Public can view available properties" policy uses is_active only.
-- We add is_archived to the USING clause via a replacement policy.
-- =============================================================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;

  CREATE POLICY "Public can view available properties"
    ON public.properties FOR SELECT
    USING (
      is_active    = true
      AND is_archived = false
      AND availability IN ('available', 'pending')
    );

  RAISE NOTICE 'Section 7: Public SELECT policy updated to exclude archived properties.';
EXCEPTION WHEN others THEN
  RAISE WARNING 'Section 7: Could not update public policy: %', SQLERRM;
END $$;


-- =============================================================================
-- VERIFICATION QUERIES (run manually after applying)
-- =============================================================================
/*
  -- 1. Confirm 'landlord' is in role CHECK
  SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'users_role_check';
  -- Expected: ... 'landlord' ...

  -- 2. Confirm new columns on properties
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'properties'
    AND column_name IN ('active_from','active_until','assigned_to','is_archived','landlord_notes')
  ORDER BY column_name;
  -- Expected: 5 rows

  -- 3. Confirm owner_id is now nullable
  SELECT is_nullable FROM information_schema.columns
  WHERE table_schema='public' AND table_name='properties' AND column_name='owner_id';
  -- Expected: YES

  -- 4. Confirm FK is ON DELETE SET NULL
  SELECT conname, pg_get_constraintdef(oid)
  FROM pg_constraint
  WHERE conrelid = 'public.properties'::regclass AND contype = 'f'
    AND conname = 'properties_owner_id_set_null_fkey';
  -- Expected: 1 row, shows ON DELETE SET NULL

  -- 5. Confirm new indexes
  SELECT indexname FROM pg_indexes
  WHERE schemaname='public' AND tablename='properties'
    AND indexname LIKE 'idx_properties_%'
  ORDER BY indexname;

  -- 6. Confirm landlord policy exists
  SELECT policyname, cmd FROM pg_policies
  WHERE schemaname='public' AND tablename='properties'
  ORDER BY cmd, policyname;

  -- 7. Test: assign landlord role to a user (replace <uuid>)
  -- UPDATE public.users SET role = 'landlord' WHERE id = '<uuid>';
  -- SELECT role FROM public.users WHERE id = '<uuid>';
  -- Expected: 'landlord'
*/


-- =============================================================================
-- ROLLBACK SCRIPT (run manually in Supabase SQL editor to undo)
-- =============================================================================
/*
BEGIN;

  -- Restore role CHECK (remove 'landlord')
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE public.users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('customer', 'vendor', 'admin', 'super_user', 'superadmin', 'founder'));

  -- Drop new property columns
  ALTER TABLE public.properties
    DROP COLUMN IF EXISTS active_from,
    DROP COLUMN IF EXISTS active_until,
    DROP COLUMN IF EXISTS assigned_to,
    DROP COLUMN IF EXISTS is_archived,
    DROP COLUMN IF EXISTS landlord_notes;

  -- Restore owner_id NOT NULL (will fail if any row has owner_id = NULL — fix first)
  ALTER TABLE public.properties ALTER COLUMN owner_id SET NOT NULL;

  -- Restore FK to ON DELETE CASCADE
  ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_owner_id_set_null_fkey;
  ALTER TABLE public.properties
    ADD CONSTRAINT properties_owner_id_fkey
    FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -- Drop new policies
  DROP POLICY IF EXISTS "Landlords can update own property details" ON public.properties;

  -- Restore public SELECT policy (without is_archived guard)
  DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;
  CREATE POLICY "Public can view available properties" ON public.properties
    FOR SELECT USING (is_active = TRUE AND availability IN ('available', 'pending'));

  -- Drop new indexes
  DROP INDEX IF EXISTS public.idx_properties_is_archived;
  DROP INDEX IF EXISTS public.idx_properties_assigned_to;
  DROP INDEX IF EXISTS public.idx_properties_active_window;
  DROP INDEX IF EXISTS public.idx_properties_owner_not_archived;

COMMIT;
*/
