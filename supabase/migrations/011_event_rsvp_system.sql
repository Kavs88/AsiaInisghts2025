-- Migration: 011_event_rsvp_system.sql
-- Description: Add RSVP system for events with status, notes, and policy agreement
-- Created: 2025-12-30
-- Phase 4 Extension: Event Detail & RSVP System

-- ============================================
-- USER EVENT INTENTS TABLE (RSVP System)
-- ============================================

-- Note: This is separate from user_event_intent (singular) which handles favourite/planning_to_attend
-- This table handles RSVP status: going, interested, not_going

CREATE TABLE IF NOT EXISTS public.user_event_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID, -- Flexible: can reference events or market_days
  market_day_id UUID REFERENCES public.market_days(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  notes TEXT, -- Dietary requirements, accessibility needs, etc.
  agreed_to_policy BOOLEAN DEFAULT FALSE, -- Cancellation pledge agreement
  attendee_count INTEGER DEFAULT 1, -- Number of attendees (+1s)
  display_name TEXT, -- Optional display name override
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure at least one of event_id or market_day_id is provided
ALTER TABLE public.user_event_intents
  ADD CONSTRAINT user_event_intents_event_check 
  CHECK ((event_id IS NOT NULL) OR (market_day_id IS NOT NULL));

-- Partial unique indexes for uniqueness constraints
-- These ensure one RSVP per user per event/market_day (only when the value is NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_event_intents_user_market_day_unique 
  ON public.user_event_intents(user_id, market_day_id) 
  WHERE market_day_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_event_intents_user_event_unique 
  ON public.user_event_intents(user_id, event_id) 
  WHERE event_id IS NOT NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_intents_user_id ON public.user_event_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_intents_market_day_id ON public.user_event_intents(market_day_id) WHERE market_day_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_event_intents_event_id ON public.user_event_intents(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_event_intents_status ON public.user_event_intents(status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_event_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_event_intents_updated_at
  BEFORE UPDATE ON public.user_event_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_event_intents_updated_at();

-- RLS Policies
ALTER TABLE public.user_event_intents ENABLE ROW LEVEL SECURITY;

-- Users can view their own intents
CREATE POLICY "Users view own intents" ON public.user_event_intents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own intents
CREATE POLICY "Users insert own intents" ON public.user_event_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own intents
CREATE POLICY "Users update own intents" ON public.user_event_intents
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own intents
CREATE POLICY "Users delete own intents" ON public.user_event_intents
  FOR DELETE USING (auth.uid() = user_id);

-- Public can view counts (aggregated, no personal data)
-- This allows event pages to show "X people going" without exposing user IDs
CREATE POLICY "Public view event counts" ON public.user_event_intents
  FOR SELECT USING (true); -- Note: This is for the view, not the table directly

-- ============================================
-- EVENT COUNTS VIEW (Public Aggregated Data)
-- ============================================

-- View for public event counts (no personal data exposed)
CREATE OR REPLACE VIEW public.event_counts AS
SELECT 
  COALESCE(market_day_id, event_id) as event_id,
  market_day_id,
  event_id as events_table_id,
  COUNT(*) FILTER (WHERE status = 'going') as going_count,
  COUNT(*) FILTER (WHERE status = 'interested') as interested_count,
  COUNT(*) FILTER (WHERE status = 'not_going') as not_going_count,
  SUM(attendee_count) FILTER (WHERE status = 'going') as total_attendees
FROM public.user_event_intents
GROUP BY market_day_id, event_id;

-- Grant access to view
GRANT SELECT ON public.event_counts TO anon, authenticated;

-- ============================================
-- INDEXES FOR VIEW PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_event_intents_user_status ON public.user_event_intents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_event_intents_market_status ON public.user_event_intents(market_day_id, status) WHERE market_day_id IS NOT NULL;

