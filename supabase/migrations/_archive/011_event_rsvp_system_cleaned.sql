-- Migration: 011_event_rsvp_system_cleaned.sql
-- Description: User RSVP commitments (public counts, private details)
-- Created: 2026-01-03
-- Cleaned: Renamed from user_event_intents, standardized on market_day_id, consolidated from _fixed version
-- Phase 4: Event Detail & RSVP System

-- ============================================
-- USER EVENT RSVPS TABLE (RSVP System)
-- ============================================

-- Drop old tables/views if exists (for clean migration)
DROP TABLE IF EXISTS public.user_event_intents CASCADE;
DROP VIEW IF EXISTS public.event_counts CASCADE;

CREATE TABLE public.user_event_rsvps (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_day_id UUID NOT NULL REFERENCES public.market_days(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('going', 'interested', 'not_going')),
  notes TEXT, -- For dietary/access needs
  agreed_to_policy BOOLEAN DEFAULT FALSE, -- Etiquette pledge
  attendee_count INTEGER DEFAULT 1 CHECK (attendee_count > 0),
  display_name TEXT, -- Optional display name
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (user_id, market_day_id)
);

-- Table comment for clarity
COMMENT ON TABLE public.user_event_rsvps IS 'User RSVP commitments (public counts, private details). Use going for confirmed attendance, interested for tentative, not_going for declined.';

COMMENT ON COLUMN public.user_event_rsvps.status IS 'RSVP status: going (confirmed), interested (tentative), not_going (declined)';
COMMENT ON COLUMN public.user_event_rsvps.agreed_to_policy IS 'User agreed to event policy/etiquette guidelines';
COMMENT ON COLUMN public.user_event_rsvps.attendee_count IS 'Number of attendees (including +1s)';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_event_rsvps_user_id ON public.user_event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_rsvps_market_day_id ON public.user_event_rsvps(market_day_id);
CREATE INDEX IF NOT EXISTS idx_user_event_rsvps_status ON public.user_event_rsvps(status);
CREATE INDEX IF NOT EXISTS idx_user_event_rsvps_user_status ON public.user_event_rsvps(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_event_rsvps_market_status ON public.user_event_rsvps(market_day_id, status);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_event_rsvps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_event_rsvps_updated_at
  BEFORE UPDATE ON public.user_event_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_user_event_rsvps_updated_at();

-- RLS Policies
ALTER TABLE public.user_event_rsvps ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to allow re-running migration)
DROP POLICY IF EXISTS "Users manage own RSVPs" ON public.user_event_rsvps;

-- Policy: Users manage own RSVPs
CREATE POLICY "Users manage own RSVPs" ON public.user_event_rsvps 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EVENT COUNTS VIEW (Public Aggregated Data)
-- ============================================

-- Create a helper view for generic counts (public, no personal data)
CREATE OR REPLACE VIEW public.event_counts AS
  SELECT 
    market_day_id as event_id,
    market_day_id,
    COUNT(*) FILTER (WHERE status = 'going') as going_count,
    COUNT(*) FILTER (WHERE status = 'interested') as interested_count,
    COUNT(*) FILTER (WHERE status = 'not_going') as not_going_count,
    SUM(attendee_count) FILTER (WHERE status = 'going') as total_attendees
  FROM public.user_event_rsvps
  GROUP BY market_day_id;

-- Grant access to view
GRANT SELECT ON public.event_counts TO anon, authenticated;

-- View comment
COMMENT ON VIEW public.event_counts IS 'Public aggregated RSVP counts for market days (no personal data exposed)';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

SELECT 'Migration 011: Event RSVP System Created (Cleaned)' as status;



