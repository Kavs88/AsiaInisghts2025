-- Migration: 012_activate_business_hub.sql
-- Description: Activates the businesses table and migrates vendors to be businesses.

-- 1. Ensure Businesses Table Exists
-- Note: It likely already exists from migration 006 with strict constraints (address NOT NULL, phone NOT NULL)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    contact_phone TEXT NOT NULL, -- Matched 006 constraint
    contact_email TEXT,
    address TEXT NOT NULL, -- Matched 006 constraint
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

-- 2. Add business_id to Vendors
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- 3. Migration Function (Updated with Placeholders for NOT NULL constraints)
CREATE OR REPLACE FUNCTION migrate_vendors_to_businesses() RETURNS void AS $$
DECLARE
    v_record RECORD;
    new_business_id UUID;
    fallback_owner_id UUID := '3eaf883d-f14c-4545-9639-feae5412fc22'; -- sam@kavsulting.com
BEGIN
    FOR v_record IN SELECT * FROM public.vendors WHERE business_id IS NULL LOOP
        
        -- Create Business record
        -- Handle NOT NULL constraints from 006 schema:
        -- address -> 'Da Nang, Vietnam' (Placeholder)
        -- contact_phone -> 'No Phone' (Placeholder if null)
        
        INSERT INTO public.businesses (
            owner_id, 
            name, 
            slug, 
            category, 
            description,
            contact_phone, 
            contact_email, 
            address, -- REQUIRED
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
            COALESCE(v_record.contact_phone, 'No Phone'), -- Fix for NOT NULL
            v_record.contact_email,
            'Da Nang, Vietnam', -- Fix for NOT NULL
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

SELECT 'Migration 012: Business Hub Activated (Constraints Satisfied)' as status;
