-- Migration: 010_attendee_intent_and_offers.sql
-- Description: Add attendee intent system and offer-event linking
-- Created: 2025-12-30
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
-- USER EVENT INTENT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_event_intent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('favourite', 'planning_to_attend')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id, intent_type)
);

-- Note: Using 'planning_to_attend' (not 'attending') for clarity and consistency

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_intent_user_id ON public.user_event_intent(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_intent_event_id ON public.user_event_intent(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_intent_type ON public.user_event_intent(intent_type);
CREATE INDEX IF NOT EXISTS idx_user_event_intent_user_type ON public.user_event_intent(user_id, intent_type);

-- RLS Policies
ALTER TABLE public.user_event_intent ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Users can read own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Users can insert own intents" ON public.user_event_intent;
DROP POLICY IF EXISTS "Users can delete own intents" ON public.user_event_intent;

-- Users can read their own intents
CREATE POLICY "Users can read own intents" ON public.user_event_intent
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own intents
CREATE POLICY "Users can insert own intents" ON public.user_event_intent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own intents
CREATE POLICY "Users can delete own intents" ON public.user_event_intent
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- DEALS TABLE UPDATE (Add event_id)
-- ============================================

-- Add event_id to deals table (nullable, for optional event linking)
ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS event_id UUID;

-- Note: No foreign key constraint to events table to maintain flexibility
-- Events can be in market_days or events table

-- Index for event-based queries
CREATE INDEX IF NOT EXISTS idx_deals_event_id ON public.deals(event_id) WHERE event_id IS NOT NULL;

-- ============================================
-- TRIGGERS
-- ============================================

-- No triggers needed for this migration

