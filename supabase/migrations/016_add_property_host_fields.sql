-- Migration 016: Add host_phone and host_email fields to properties table
-- Description: Adds optional host contact fields for properties (separate from general contact)
-- Dependencies: 006_properties_events_businesses_schema.sql, 015_extend_properties_for_event_spaces.sql

-- Add host contact fields (optional, for properties where host contact differs from general contact)
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS host_phone TEXT,
ADD COLUMN IF NOT EXISTS host_email TEXT;

-- Add index for host_phone (if needed for queries)
CREATE INDEX IF NOT EXISTS idx_properties_host_phone ON public.properties(host_phone) WHERE host_phone IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN public.properties.host_phone IS 'Direct contact phone for property host/manager (optional, falls back to contact_phone)';
COMMENT ON COLUMN public.properties.host_email IS 'Direct contact email for property host/manager (optional, falls back to contact_email)';



