-- Migration: 018_community_gravity.sql
-- Description: Implements "Community Gravity" features: Trust Badges, Event Participation, and Soft Follows/Saves.

-- 1. Trust Badges on Entities (Manual Trust Signals)
ALTER TABLE public.entities 
ADD COLUMN IF NOT EXISTS trust_badges TEXT[] DEFAULT '{}';

-- Index for filtering by badges
CREATE INDEX IF NOT EXISTS idx_entities_trust_badges ON public.entities USING gin(trust_badges);


-- 2. Event Participating Entities (Event -> Entity Reinforcement)
CREATE TABLE IF NOT EXISTS public.event_participating_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'participant', -- 'host', 'participant', 'sponsor', 'speaker'
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.event_participating_entities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Event participants are publicly viewable" ON public.event_participating_entities
    FOR SELECT USING (is_public = TRUE);

-- Admin/Host write access (simplified to authenticated for now, strictness to follow)
CREATE POLICY "Authenticated users can manage participants" ON public.event_participating_entities
    FOR ALL USING (auth.role() = 'authenticated');


-- 3. User Follows (Soft Follow - Silent Memory)
CREATE TABLE IF NOT EXISTS public.user_follows (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL REFERENCES public.entities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, entity_id)
);

-- Enable RLS
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own follows
CREATE POLICY "Users can manage their own follows" ON public.user_follows
    FOR ALL USING (auth.uid() = user_id);


-- 4. User Saved Items (Soft Save - Silent Memory)
CREATE TABLE IF NOT EXISTS public.user_saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('event', 'product', 'property', 'entity')),
    item_id UUID NOT NULL, -- Polymorphic ID, verified at application layer or via trigger if strictness needed
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_items ENABLE ROW LEVEL SECURITY;

-- Users can view/manage their own saved items
CREATE POLICY "Users can manage their own saved items" ON public.user_saved_items
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_parts_event ON public.event_participating_entities(event_id);
CREATE INDEX IF NOT EXISTS idx_event_parts_entity ON public.event_participating_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_user ON public.user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_user ON public.user_saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_item ON public.user_saved_items(item_type, item_id);
