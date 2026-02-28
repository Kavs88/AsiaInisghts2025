-- Migration: 011_event_rsvp_system_fixed.sql
-- Description: Create user_event_intents table with simplified schema
-- Created: 2025-12-30
-- Critical Platform Remediation

-- ============================================
-- USER EVENT INTENTS TABLE (RSVP System)
-- ============================================

-- Drop table if exists to allow clean recreation
DROP TABLE IF EXISTS public.user_event_intents CASCADE;
DROP VIEW IF EXISTS public.event_counts CASCADE;

CREATE TABLE public.user_event_intents (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID, -- Polymorphic link support
  market_day_id UUID REFERENCES public.market_days(id) ON DELETE CASCADE, 
  
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  notes TEXT, -- For dietary/access needs
  agreed_to_policy BOOLEAN DEFAULT FALSE, -- Etiquette pledge
  attendee_count INTEGER DEFAULT 1,
  display_name TEXT, -- Optional display name
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_id, market_day_id) -- Primary constraint
);

-- Ensure at least one of event_id or market_day_id is provided
ALTER TABLE public.user_event_intents
  ADD CONSTRAINT user_event_intents_event_check 
  CHECK ((event_id IS NOT NULL) OR (market_day_id IS NOT NULL));

-- Partial unique index for event_id (when market_day_id is NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_event_intents_user_event_unique 
  ON public.user_event_intents(user_id, event_id) 
  WHERE event_id IS NOT NULL AND market_day_id IS NULL;

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

-- Drop existing policy if it exists (to allow re-running migration)
DROP POLICY IF EXISTS "Users manage own intents" ON public.user_event_intents;

-- Policy: Users manage own intents
CREATE POLICY "Users manage own intents" ON public.user_event_intents 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EVENT COUNTS VIEW (Public Aggregated Data)
-- ============================================

-- Create a helper view for generic counts
CREATE OR REPLACE VIEW public.event_counts AS
  SELECT 
    COALESCE(market_day_id, event_id) as event_id,
    market_day_id,
    event_id as events_table_id,
    count(*) FILTER (WHERE status = 'going') as going_count,
    count(*) FILTER (WHERE status = 'interested') as interested_count,
    count(*) FILTER (WHERE status = 'not_going') as not_going_count,
    SUM(attendee_count) FILTER (WHERE status = 'going') as total_attendees
  FROM public.user_event_intents
  GROUP BY market_day_id, event_id;

-- Grant access to view
GRANT SELECT ON public.event_counts TO anon, authenticated;

