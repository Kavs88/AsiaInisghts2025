-- Migration: 010_user_event_bookmarks_cleaned.sql
-- Description: User bookmarks and planning list (private, for discovery)
-- Created: 2026-01-03
-- Cleaned: Renamed from user_event_intent, standardized on market_day_id
-- Phase 3.5: Attendee Intent & Offer Integration

-- ============================================
-- USER ROLES UPDATE
-- ============================================

-- Update users table to support new roles
ALTER TABLE public.users 
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('customer', 'vendor', 'admin', 'business_user', 'attendee_user'));

-- Note: business_user is alias for vendor (for clarity)
-- attendee_user is new lightweight role

-- ============================================
-- USER EVENT BOOKMARKS TABLE
-- ============================================

-- Drop old table if exists (for clean migration)
DROP TABLE IF EXISTS public.user_event_intent CASCADE;

CREATE TABLE IF NOT EXISTS public.user_event_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  market_day_id UUID NOT NULL REFERENCES public.market_days(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('saved', 'planning_to_attend')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, market_day_id, intent_type)
);

-- Table comment for clarity
COMMENT ON TABLE public.user_event_bookmarks IS 'User bookmarks and planning list (private, for discovery). Use saved for favourites, planning_to_attend for events user plans to attend.';

COMMENT ON COLUMN public.user_event_bookmarks.intent_type IS 'Type of bookmark: saved (favourite) or planning_to_attend (user plans to attend)';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_bookmarks_user_id ON public.user_event_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_bookmarks_market_day_id ON public.user_event_bookmarks(market_day_id);
CREATE INDEX IF NOT EXISTS idx_user_event_bookmarks_intent_type ON public.user_event_bookmarks(intent_type);
CREATE INDEX IF NOT EXISTS idx_user_event_bookmarks_user_type ON public.user_event_bookmarks(user_id, intent_type);

-- RLS Policies
ALTER TABLE public.user_event_bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Users can read own bookmarks" ON public.user_event_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.user_event_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.user_event_bookmarks;

-- Users can read their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON public.user_event_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON public.user_event_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON public.user_event_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DEALS TABLE UPDATE (Add market_day_id)
-- ============================================

-- Add market_day_id to deals table (nullable, for optional market day linking)
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS market_day_id UUID REFERENCES public.market_days(id) ON DELETE SET NULL;

-- Keep event_id for backward compatibility but prefer market_day_id
-- Index for market day-based queries
CREATE INDEX IF NOT EXISTS idx_deals_market_day_id ON public.deals(market_day_id) WHERE market_day_id IS NOT NULL;

-- Keep existing event_id index for backward compatibility
CREATE INDEX IF NOT EXISTS idx_deals_event_id ON public.deals(event_id) WHERE event_id IS NOT NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'Migration 010: User Event Bookmarks Created (Cleaned)' as status;



