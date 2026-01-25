-- ============================================
-- HOSTS / VENUES SYSTEM
-- ============================================
-- Purpose: Create hosts/venues table and link to market_days
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE HOSTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.hosts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    description TEXT,
    website_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    facilities TEXT[], -- Array of facility strings (e.g., 'Parking', 'Restrooms')
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_hosts_slug ON public.hosts(slug);

-- Enable RLS
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: ADD HOST_ID TO MARKET_DAYS
-- ============================================

-- Add host_id column to market_days (nullable, so existing rows are fine)
ALTER TABLE public.market_days 
ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL;

-- Create index on host_id for faster joins
CREATE INDEX IF NOT EXISTS idx_market_days_host_id ON public.market_days(host_id);

-- ============================================
-- STEP 3: RLS POLICIES FOR HOSTS
-- ============================================

-- Public can view all hosts
CREATE POLICY "Hosts are publicly viewable"
    ON public.hosts FOR SELECT
    USING (true);

-- Admins can insert hosts
CREATE POLICY "Admins can insert hosts"
    ON public.hosts FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update hosts
CREATE POLICY "Admins can update hosts"
    ON public.hosts FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete hosts
CREATE POLICY "Admins can delete hosts"
    ON public.hosts FOR DELETE
    USING (is_admin(auth.uid()));

-- Service role can manage hosts
CREATE POLICY "Service role can manage hosts"
    ON public.hosts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STEP 4: CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_hosts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_hosts_updated_at
    BEFORE UPDATE ON public.hosts
    FOR EACH ROW
    EXECUTE FUNCTION update_hosts_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the setup:
-- 
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'hosts';
--
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'market_days' AND column_name = 'host_id';
--
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'hosts';


