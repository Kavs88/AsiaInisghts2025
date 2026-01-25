-- Migration: 009_fix_schema_uplift.sql
-- Description: Non-destructive script to add missing columns required by the latest Properties Hub and Events Hub logic.
-- Run this before running 008_seed_clean.sql if you encounter "column does not exist" errors.

-- 1. Uplift Properties Table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS property_type TEXT NOT NULL DEFAULT 'rental' CHECK (property_type IN ('rental', 'event_space')),
ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity > 0);

-- Indices for Properties
CREATE INDEX IF NOT EXISTS idx_properties_business_id ON public.properties(business_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);

-- 2. Uplift Events Table
-- Check if start_at and end_at exist, if not, create them.
-- If event_date exists, we could migrate data, but for a "clean" script, we just ensure columns exist.
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- If start_at is NULL but event_date exists, migrate data
UPDATE public.events 
SET start_at = (event_date + COALESCE(start_time, '00:00:00'::TIME))::TIMESTAMPTZ
WHERE start_at IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='event_date');

-- Update start_at to NOT NULL if all values are set
-- ALTER TABLE public.events ALTER COLUMN start_at SET NOT NULL; -- Optional, might fail if data is messy

-- Indices for Events
CREATE INDEX IF NOT EXISTS idx_events_start_at ON public.events(start_at);

-- 3. Uplift Businesses Table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Indices for Businesses
CREATE INDEX IF NOT EXISTS idx_businesses_hero_image ON public.businesses(hero_image_url);
CREATE INDEX IF NOT EXISTS idx_businesses_tagline ON public.businesses(tagline);
