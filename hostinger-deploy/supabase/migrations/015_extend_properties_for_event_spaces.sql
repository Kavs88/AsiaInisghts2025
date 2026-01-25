-- Migration 015: Extend Properties Table for Event Spaces
-- Description: Adds property_type distinction (rental vs event_space) and event space specific fields
-- Dependencies: 006_properties_events_businesses_schema.sql

-- ============================================
-- EXTEND PROPERTIES TABLE FOR EVENT SPACES
-- ============================================

-- Add property_type to distinguish between rental properties and event spaces
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS property_type TEXT NOT NULL DEFAULT 'rental'
CHECK (property_type IN ('rental', 'event_space'));

-- Add event space specific fields (nullable, only used when property_type = 'event_space')
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity > 0),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) CHECK (hourly_rate >= 0),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2) CHECK (daily_rate >= 0);

-- Add business_id to link event spaces to businesses (e.g., a business managing a venue)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- Rename existing 'price' column to 'monthly_rental_price' for clarity
-- (We'll keep both for backward compatibility, but add a comment)
COMMENT ON COLUMN public.properties.price IS 'Monthly rental price (for rental properties only)';

-- Add index for property_type (for filtering)
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);

-- Add index for business_id (for linking event spaces to businesses)
CREATE INDEX IF NOT EXISTS idx_properties_business_id ON public.properties(business_id) WHERE business_id IS NOT NULL;

-- Add composite index for property_type + availability (common query pattern)
CREATE INDEX IF NOT EXISTS idx_properties_type_availability ON public.properties(property_type, availability) WHERE is_active = true;

-- ============================================
-- UPDATE EXISTING DATA
-- ============================================

-- Set all existing properties to 'rental' type (they were created before this distinction)
UPDATE public.properties
SET property_type = 'rental'
WHERE property_type IS NULL OR property_type = '';

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN public.properties.property_type IS 'Type of property: rental (residential/commercial) or event_space (venue for events)';
COMMENT ON COLUMN public.properties.capacity IS 'Maximum capacity for event spaces (NULL for rental properties)';
COMMENT ON COLUMN public.properties.hourly_rate IS 'Hourly rental rate for event spaces (NULL for rental properties)';
COMMENT ON COLUMN public.properties.daily_rate IS 'Daily rental rate for event spaces (NULL for rental properties)';
COMMENT ON COLUMN public.properties.business_id IS 'Business managing this property (optional, for event spaces managed by businesses)';
COMMENT ON COLUMN public.properties.bedrooms IS 'Number of bedrooms (NULL for event spaces)';
COMMENT ON COLUMN public.properties.bathrooms IS 'Number of bathrooms (NULL for event spaces)';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verification query (run manually to verify):
-- SELECT property_type, COUNT(*) FROM public.properties GROUP BY property_type;



