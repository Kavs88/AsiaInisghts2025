-- Add venue logo and facilities fields to market_days table
-- This allows each market location to have a logo and profile information

ALTER TABLE public.market_days
ADD COLUMN IF NOT EXISTS venue_logo_url TEXT,
ADD COLUMN IF NOT EXISTS venue_description TEXT,
ADD COLUMN IF NOT EXISTS venue_facilities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS venue_website_url TEXT,
ADD COLUMN IF NOT EXISTS venue_contact_email TEXT,
ADD COLUMN IF NOT EXISTS venue_contact_phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.market_days.venue_logo_url IS 'URL to the venue/host logo image';
COMMENT ON COLUMN public.market_days.venue_description IS 'Description of the venue/host location';
COMMENT ON COLUMN public.market_days.venue_facilities IS 'Array of facilities available at the venue (e.g., ["Parking", "Restrooms", "Food Court", "Playground"])';
COMMENT ON COLUMN public.market_days.venue_website_url IS 'Website URL for the venue/host';
COMMENT ON COLUMN public.market_days.venue_contact_email IS 'Contact email for the venue/host';
COMMENT ON COLUMN public.market_days.venue_contact_phone IS 'Contact phone for the venue/host';


