-- =============================================================================
-- Migration: 030_social_signals_and_watchlist.sql
-- Project:   Asia Insights / Sunday Market Platform
-- Purpose:   Add social signal engagement buttons (Recommend, Regular) on
--            Business pages and a "Keep an Eye On It" watchlist for Properties.
--            Creates business_engagements and property_watchlist tables with
--            full RLS, unique constraints, and toggle support.
-- Safety:    Idempotent. Includes rollback section.
-- Depends:   029_decouple_business_ownership.sql (for role CHECK extension)
-- =============================================================================


-- =============================================================================
-- SECTION 1: Engagement Type Enum
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.engagement_type AS ENUM ('recommend', 'regular');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


-- =============================================================================
-- SECTION 2: business_engagements table
-- One record per (user_id, business_id, engagement_type) — unique constraint
-- enforces one engagement of each type per user per business.
-- Toggle off = DELETE the row.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.business_engagements (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id     UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  engagement_type public.engagement_type NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_business_engagement
    UNIQUE (user_id, business_id, engagement_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_be_business_id      ON public.business_engagements(business_id);
CREATE INDEX IF NOT EXISTS idx_be_user_id          ON public.business_engagements(user_id);
CREATE INDEX IF NOT EXISTS idx_be_type             ON public.business_engagements(engagement_type);
CREATE INDEX IF NOT EXISTS idx_be_business_type    ON public.business_engagements(business_id, engagement_type);
CREATE INDEX IF NOT EXISTS idx_be_user_type        ON public.business_engagements(user_id, engagement_type);


-- =============================================================================
-- SECTION 3: property_watchlist table
-- One record per (user_id, property_id) — unique constraint enforces dedup.
-- Toggle off = DELETE the row.
-- Future: price_drop_notify and status_change_notify columns for alert system.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.property_watchlist (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id          UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  price_drop_notify    BOOLEAN     NOT NULL DEFAULT false,
  status_change_notify BOOLEAN     NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_property_watchlist
    UNIQUE (user_id, property_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pw_property_id ON public.property_watchlist(property_id);
CREATE INDEX IF NOT EXISTS idx_pw_user_id     ON public.property_watchlist(user_id);


-- =============================================================================
-- SECTION 4: Enable RLS
-- =============================================================================

ALTER TABLE public.business_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_engagements FORCE ROW LEVEL SECURITY;

ALTER TABLE public.property_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_watchlist FORCE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 5: Drop existing policies (idempotent guard)
-- =============================================================================

-- business_engagements
DROP POLICY IF EXISTS "Users view own engagements"              ON public.business_engagements;
DROP POLICY IF EXISTS "Users insert own engagements"           ON public.business_engagements;
DROP POLICY IF EXISTS "Users delete own engagements"           ON public.business_engagements;
DROP POLICY IF EXISTS "Admins view all engagements"            ON public.business_engagements;
DROP POLICY IF EXISTS "Public view aggregate counts"           ON public.business_engagements;

-- property_watchlist
DROP POLICY IF EXISTS "Users view own watchlist"               ON public.property_watchlist;
DROP POLICY IF EXISTS "Users insert own watchlist"             ON public.property_watchlist;
DROP POLICY IF EXISTS "Users update own watchlist"             ON public.property_watchlist;
DROP POLICY IF EXISTS "Users delete own watchlist"             ON public.property_watchlist;
DROP POLICY IF EXISTS "Admins view all watchlists"             ON public.property_watchlist;


-- =============================================================================
-- SECTION 6: RLS Policies — business_engagements
--
-- Public:      Cannot see user-level rows (privacy).
--              Aggregated counts are exposed via a separate VIEW (Section 8).
-- Authenticated users: CRUD their own rows only.
-- Admin/Founder: Full SELECT for analytics.
-- No UPDATE policy — engagements are immutable (toggle = delete + re-insert).
-- =============================================================================

-- SELECT: own rows
CREATE POLICY "Users view own engagements"
  ON public.business_engagements FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: admin analytics
CREATE POLICY "Admins view all engagements"
  ON public.business_engagements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id   = auth.uid()
        AND role IN ('admin', 'superadmin', 'super_user', 'founder')
    )
  );

-- INSERT: authenticated, own row only
CREATE POLICY "Users insert own engagements"
  ON public.business_engagements FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );

-- DELETE: own row only (toggle off)
CREATE POLICY "Users delete own engagements"
  ON public.business_engagements FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- SECTION 7: RLS Policies — property_watchlist
-- =============================================================================

-- SELECT: own rows
CREATE POLICY "Users view own watchlist"
  ON public.property_watchlist FOR SELECT
  USING (user_id = auth.uid());

-- SELECT: admin analytics
CREATE POLICY "Admins view all watchlists"
  ON public.property_watchlist FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id   = auth.uid()
        AND role IN ('admin', 'superadmin', 'super_user', 'founder')
    )
  );

-- INSERT: authenticated, own row only
CREATE POLICY "Users insert own watchlist"
  ON public.property_watchlist FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );

-- UPDATE: own row only (for toggling notification prefs)
CREATE POLICY "Users update own watchlist"
  ON public.property_watchlist FOR UPDATE
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: own row only (toggle off)
CREATE POLICY "Users delete own watchlist"
  ON public.property_watchlist FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- SECTION 8: Public aggregate views (no user-level data exposed)
-- These are SECURITY DEFINER views so unauthenticated users can read counts
-- without bypassing RLS on the base tables.
-- =============================================================================

-- Engagement counts per business (public-safe: no user identity)
CREATE OR REPLACE VIEW public.business_engagement_counts
  WITH (security_invoker = false)
AS
SELECT
  business_id,
  engagement_type,
  COUNT(*) AS count
FROM public.business_engagements
GROUP BY business_id, engagement_type;

-- Watchlist counts per property (public-safe)
CREATE OR REPLACE VIEW public.property_watchlist_counts
  WITH (security_invoker = false)
AS
SELECT
  property_id,
  COUNT(*) AS count
FROM public.property_watchlist
GROUP BY property_id;

-- Grant public read on aggregate views
GRANT SELECT ON public.business_engagement_counts  TO anon, authenticated;
GRANT SELECT ON public.property_watchlist_counts   TO anon, authenticated;


-- =============================================================================
-- ROLLBACK (run manually to undo this migration)
-- =============================================================================

/*
-- ROLLBACK SCRIPT

BEGIN;

DROP VIEW  IF EXISTS public.property_watchlist_counts;
DROP VIEW  IF EXISTS public.business_engagement_counts;

DROP TABLE IF EXISTS public.property_watchlist;
DROP TABLE IF EXISTS public.business_engagements;

DROP TYPE  IF EXISTS public.engagement_type;

COMMIT;
*/


-- =============================================================================
-- POST-MIGRATION VERIFICATION CHECKLIST
-- =============================================================================

/*
-- 1. Confirm tables exist with correct columns
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('business_engagements', 'property_watchlist')
ORDER BY table_name, ordinal_position;

-- 2. Confirm unique constraints
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname IN ('uq_business_engagement', 'uq_property_watchlist');

-- 3. Confirm RLS is active on both tables
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('business_engagements', 'property_watchlist');
-- Expected: rowsecurity = true, forcerowsecurity = true

-- 4. Confirm policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('business_engagements', 'property_watchlist')
ORDER BY tablename, cmd;

-- 5. Confirm aggregate views exist
SELECT viewname FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('business_engagement_counts', 'property_watchlist_counts');

-- 6. Test engagement uniqueness (run as authenticated user)
-- INSERT INTO public.business_engagements (user_id, business_id, engagement_type)
-- VALUES (auth.uid(), '<business_uuid>', 'recommend');
-- Second insert with same values should return unique violation.

-- 7. Test toggle (delete + re-insert pattern)
-- DELETE FROM public.business_engagements
-- WHERE user_id = auth.uid() AND business_id = '<uuid>' AND engagement_type = 'recommend';
*/
