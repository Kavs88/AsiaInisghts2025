-- Migration: 020_trust_signals.sql
-- Description: Adds 'user_entity_signals' table for manual trust signals (Recommend, Regular).
--             Adds 'founder_recommended' boolean to entities for top-tier endorsement.

-- 1. Create User Entity Signals Table
CREATE TYPE public.signal_type AS ENUM ('recommend', 'regular');

CREATE TABLE IF NOT EXISTS public.user_entity_signals (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE,
    signal_type public.signal_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, entity_id, signal_type)
);

-- 2. Add Founder Recommended Flag to Entities and Legacy Tables
ALTER TABLE public.entities
ADD COLUMN IF NOT EXISTS founder_recommended BOOLEAN DEFAULT FALSE;

ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS founder_recommended BOOLEAN DEFAULT FALSE;

ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS founder_recommended BOOLEAN DEFAULT FALSE;

-- Sync function for founder_recommended
CREATE OR REPLACE FUNCTION public.sync_founder_recommended_to_legacy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'vendor' AND NEW.legacy_vendor_id IS NOT NULL THEN
        UPDATE public.vendors 
        SET founder_recommended = NEW.founder_recommended 
        WHERE id = NEW.legacy_vendor_id;
    ELSIF NEW.type = 'business' AND NEW.legacy_business_id IS NOT NULL THEN
        UPDATE public.businesses 
        SET founder_recommended = NEW.founder_recommended 
        WHERE id = NEW.legacy_business_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_founder_recommended ON public.entities;
CREATE TRIGGER trigger_sync_founder_recommended
    AFTER UPDATE OF founder_recommended ON public.entities
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_founder_recommended_to_legacy();

-- 3. Enable RLS
ALTER TABLE public.user_entity_signals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Users can read all signals (silent graph, but data is public)
CREATE POLICY "Signals are viewable by everyone" ON public.user_entity_signals
    FOR SELECT USING (true);

-- Authenticated users can create their own signals
CREATE POLICY "Users can create their own signals" ON public.user_entity_signals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own signals
CREATE POLICY "Users can delete their own signals" ON public.user_entity_signals
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_signals_entity_id ON public.user_entity_signals(entity_id);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON public.user_entity_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_founder_recommended ON public.entities(founder_recommended) WHERE founder_recommended = TRUE;
