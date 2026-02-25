-- Migration: 017_unified_intelligence_foundation.sql
-- Description: Establishes the Unified Entity Model and Intelligence Layer Foundation.
--             Unifies 'vendors' and 'businesses' into 'entities'.
--             Enables pgvector for future embedding support.
--             Creates 'insights_drafts' for automated ingestion.

-- 1. Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Entity Type Enum
DO $$ BEGIN
    CREATE TYPE public.entity_type AS ENUM ('vendor', 'business', 'service', 'venue', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Unified Entities Table
CREATE TABLE IF NOT EXISTS public.entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Nullable as some entities might be system-managed
    type public.entity_type NOT NULL DEFAULT 'other',
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    location_text TEXT, -- Raw address or region
    geo_scope TEXT DEFAULT 'local', -- 'local', 'regional', 'national'
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata & Trust
    source TEXT DEFAULT 'manual', -- 'manual', 'import', 'user_submission'
    confidence_score INTEGER DEFAULT 100 CHECK (confidence_score BETWEEN 0 AND 100),
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    is_locked_by_human BOOLEAN DEFAULT FALSE, -- If true, automation cannot overwrite critical fields
    
    -- Legacy ID references (for backwards compatibility/migration tracking)
    legacy_vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    legacy_business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,

    -- Vector Embedding (Prepared for Phase 2)
    -- embedding vector(1536), -- Uncomment when pgvector is fully configured in prod

    -- Standard Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on Entities
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;

-- Policy: Public Read
CREATE POLICY "Entities are publicly viewable" ON public.entities
    FOR SELECT USING (true); -- Simplified for now, can refine later

-- Policy: Admin/Owner Write
CREATE POLICY "Owners can update their entities" ON public.entities
    FOR UPDATE USING (auth.uid() = owner_id);

-- 5. Data Migration: Migrate Vendors to Entities
INSERT INTO public.entities (
    owner_id, type, name, slug, description, location_text, tags, source, legacy_vendor_id, created_at
)
SELECT 
    user_id, 
    'vendor'::public.entity_type, 
    name, 
    slug, 
    bio, 
    NULL, -- Vendors table didn't have a clear address field in early schemas, defaulting to NULL
    ARRAY[category], -- Convert single category to tag array
    'migration_vendor',
    id,
    created_at
FROM public.vendors
ON CONFLICT (slug) DO NOTHING; -- Skip if slug exists (dual-listed)

-- 6. Data Migration: Migrate Businesses to Entities
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
    'migration_business',
    id,
    created_at
FROM public.businesses
ON CONFLICT (slug) DO NOTHING;

-- 7. Create Insights Drafts Table (Automation Target)
CREATE TABLE IF NOT EXISTS public.insights_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_text TEXT NOT NULL,
    source_url TEXT,
    detected_region TEXT,
    detected_topic TEXT,
    
    -- Workflow State
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- 8. Enable RLS on Insights Drafts
ALTER TABLE public.insights_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Admin Only (Strict Internal Tool)
-- Note: Assuming 'admin' role existence from previous verification
CREATE POLICY "Admins can manage insights" ON public.insights_drafts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- 9. Create Indexes
CREATE INDEX IF NOT EXISTS idx_entities_id ON public.entities(id);
CREATE INDEX IF NOT EXISTS idx_entities_type ON public.entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON public.entities(slug);
CREATE INDEX IF NOT EXISTS idx_entities_tags ON public.entities USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_insights_status ON public.insights_drafts(status);

-- 10. Trigger for updated_at
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON public.entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
