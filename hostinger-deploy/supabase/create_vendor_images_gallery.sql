-- ============================================
-- VENDOR IMAGE GALLERY SYSTEM
-- ============================================
-- Purpose: Allow vendors to have multiple gallery images
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE VENDOR_IMAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.vendor_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, image_url)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_images_vendor_id ON public.vendor_images(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_images_display_order ON public.vendor_images(vendor_id, display_order);

-- Enable RLS
ALTER TABLE public.vendor_images ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: RLS POLICIES FOR VENDOR_IMAGES
-- ============================================

-- Public can view all vendor images
CREATE POLICY "Vendor images are publicly viewable"
    ON public.vendor_images FOR SELECT
    USING (true);

-- Admins can insert vendor images
CREATE POLICY "Admins can insert vendor images"
    ON public.vendor_images FOR INSERT
    WITH CHECK (is_admin(auth.uid()));

-- Admins can update vendor images
CREATE POLICY "Admins can update vendor images"
    ON public.vendor_images FOR UPDATE
    USING (is_admin(auth.uid()));

-- Admins can delete vendor images
CREATE POLICY "Admins can delete vendor images"
    ON public.vendor_images FOR DELETE
    USING (is_admin(auth.uid()));

-- Service role can manage vendor images
CREATE POLICY "Service role can manage vendor images"
    ON public.vendor_images FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- STEP 3: CREATE TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_vendor_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_vendor_images_updated_at
    BEFORE UPDATE ON public.vendor_images
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_images_updated_at();

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the setup:
--
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'vendor_images';
--
-- SELECT policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'vendor_images';


