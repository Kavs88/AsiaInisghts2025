-- Migration: 012_activate_business_hub_cleaned.sql
-- Description: Activates the businesses table and migrates vendors to be businesses
-- Created: 2026-01-03
-- Cleaned: Fixed data quality issues - make address/phone nullable or use vendor data

-- 1. Ensure Businesses Table Exists
-- Note: It likely already exists from migration 006 with strict constraints
-- We'll make address and phone nullable to avoid placeholder data
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_phone TEXT, -- Made nullable to avoid "No Phone" placeholders
    contact_email TEXT,
    address TEXT, -- Made nullable to avoid placeholder addresses
    location_coords POINT,
    website_url TEXT,
    opening_hours JSONB,
    social_links JSONB,
    logo_url TEXT,
    images TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If table exists with NOT NULL constraints, alter them
DO $$ 
BEGIN
    -- Make contact_phone nullable if it's currently NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses' 
        AND column_name = 'contact_phone' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.businesses ALTER COLUMN contact_phone DROP NOT NULL;
    END IF;

    -- Make address nullable if it's currently NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses' 
        AND column_name = 'address' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.businesses ALTER COLUMN address DROP NOT NULL;
    END IF;
END $$;

-- 2. Add business_id to Vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- 3. Migration Function (Updated - no placeholders, use actual vendor data or NULL)
CREATE OR REPLACE FUNCTION migrate_vendors_to_businesses() RETURNS void AS $$
DECLARE
    v_record RECORD;
    new_business_id UUID;
    fallback_owner_id UUID := '3eaf883d-f14c-4545-9639-feae5412fc22'; -- sam@kavsulting.com
BEGIN
    FOR v_record IN SELECT * FROM public.vendors WHERE business_id IS NULL LOOP
        
        -- Create Business record
        -- Use actual vendor data, or NULL if not available (no placeholders)
        
        INSERT INTO public.businesses (
            owner_id, 
            name, 
            slug, 
            category, 
            description,
            contact_phone, -- Can be NULL now
            contact_email,
            address, -- Can be NULL now
            website_url, 
            logo_url,
            is_verified, 
            is_active
        ) VALUES (
            COALESCE(v_record.user_id, fallback_owner_id),
            v_record.name,
            v_record.slug,
            COALESCE(v_record.category, 'retail'),
            v_record.bio,
            v_record.contact_phone, -- Use actual value or NULL
            v_record.contact_email,
            NULL, -- Don't use placeholder, leave NULL if vendor has no address
            v_record.website_url,
            v_record.logo_url,
            v_record.is_verified,
            v_record.is_active
        ) RETURNING id INTO new_business_id;

        -- Link Vendor to Business
        UPDATE public.vendors SET business_id = new_business_id WHERE id = v_record.id;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 4. Run Migration
SELECT migrate_vendors_to_businesses();

-- 5. Enable RLS on Businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage own business" ON public.businesses;
CREATE POLICY "Owners manage own business" ON public.businesses
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6. Add Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_business_id ON public.vendors(business_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category);

SELECT 'Migration 012: Business Hub Activated (Data Quality Fixed)' as status;

