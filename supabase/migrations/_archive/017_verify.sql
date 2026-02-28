-- Verification Script for Migration 017
-- Run this in your Supabase SQL Editor to confirm success.

DO $$
DECLARE
    vendor_count INT;
    business_count INT;
    entity_count INT;
    vector_enabled BOOLEAN;
BEGIN
    -- 1. Check if pgvector is enabled
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') INTO vector_enabled;
    
    IF vector_enabled THEN
        RAISE NOTICE '✅ Extension [vector] is ENABLED.';
    ELSE
        RAISE WARNING '❌ Extension [vector] is NOT enabled.';
    END IF;

    -- 2. Check Table Existence
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entities') THEN
        RAISE NOTICE '✅ Table [entities] EXISTS.';
    ELSE
        RAISE WARNING '❌ Table [entities] is MISSING.';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'insights_drafts') THEN
        RAISE NOTICE '✅ Table [insights_drafts] EXISTS.';
    ELSE
        RAISE WARNING '❌ Table [insights_drafts] is MISSING.';
    END IF;

    -- 3. Verify Data Migration Counts
    SELECT COUNT(*) INTO vendor_count FROM public.vendors;
    SELECT COUNT(*) INTO business_count FROM public.businesses;
    SELECT COUNT(*) INTO entity_count FROM public.entities;

    RAISE NOTICE '📊 Stats: Vendors: %, Businesses: %, Entities: %', vendor_count, business_count, entity_count;

    IF entity_count >= (vendor_count + business_count) THEN
         -- Note: Might be slightly less if there were duplicate slugs handled by ON CONFLICT
        RAISE NOTICE '✅ Data Migration seems SUCCESSFUL (Entity count matches or exceeds source).';
    ELSE
        RAISE NOTICE '⚠️ Entity count is lower than sum of sources. Check for duplicate slugs.';
    END IF;

    -- 4. Verify Column Structure (Spot Check)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'entities' AND column_name = 'confidence_score') THEN
        RAISE NOTICE '✅ Column [confidence_score] EXISTS in entities.';
    ELSE
        RAISE WARNING '❌ Column [confidence_score] is MISSING.';
    END IF;

END $$;
