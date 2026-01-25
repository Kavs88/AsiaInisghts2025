-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  host_type TEXT NOT NULL CHECK (host_type IN ('vendor', 'user')),
  host_id UUID NOT NULL,
  venue_type TEXT NOT NULL CHECK (venue_type IN ('vendor', 'property', 'custom')),
  venue_id UUID,
  venue_address_json JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies for public read
CREATE POLICY "Enable read access for all users" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON public.deals
    FOR SELECT USING (true);

-- Policies for admin/vendor write (simplified for now, assumes server-side or admin check)
CREATE POLICY "Enable write access for admins and owners" ON public.events
    FOR ALL USING (auth.role() = 'authenticated'); 

CREATE POLICY "Enable write access for admins and owners" ON public.deals
    FOR ALL USING (auth.role() = 'authenticated');
