-- Migration: 021_ensure_data.sql
-- Description: Fail-safe migration to ensure 'entities' are backfilled and Phase 4 tables exist.
--             This is necessary because previous migrations might have been interrupted.

-- 1. Ensure Phase 4 Tables Exist (Idempotent)
CREATE TABLE IF NOT EXISTS public.founder_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
    note TEXT NOT NULL,
    visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('internal', 'public', 'team')),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.founder_tags (
    entity_id UUID REFERENCES public.entities(id) ON DELETE CASCADE NOT NULL,
    tag TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (entity_id, tag)
);

-- 2. Backfill Entities from Vendors (if missing)
INSERT INTO public.entities (
    owner_id, type, name, slug, description, location_text, tags, source, legacy_vendor_id, created_at
)
SELECT 
    user_id, 
    'vendor'::public.entity_type, 
    name, 
    slug, 
    bio, 
    NULL,
    ARRAY[category], 
    'migration_vendor_retry',
    id,
    created_at
FROM public.vendors
ON CONFLICT (slug) DO NOTHING;

-- 3. Backfill Entities from Businesses (if missing)
INSERT INTO public.entities (
    owner_id, type, name, slug, description, location_text, tags, source, legacy_business_id, created_at
)
SELECT 
    owner_id, 
    'business'::public.entity_type, 
    name, 
    slug, 
    description, 
    address, 
    ARRAY[category], 
    'migration_business_retry',
    id,
    created_at
FROM public.businesses
ON CONFLICT (slug) DO NOTHING;

-- 4. Enable RLS (Idempotent)
ALTER TABLE public.founder_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_tags ENABLE ROW LEVEL SECURITY;

-- 5. Grant Permissions (Fix "Relationship not found" by ensuring visibility)
GRANT SELECT ON public.founder_tags TO anon, authenticated;
GRANT SELECT ON public.founder_notes TO anon, authenticated;
GRANT SELECT ON public.entities TO anon, authenticated;

-- 6. Refresh Schema Cache Hint (Notify Postgrest)
NOTIFY pgrst, 'reload schema';
