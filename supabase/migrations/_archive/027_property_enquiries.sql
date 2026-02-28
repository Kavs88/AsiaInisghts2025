-- Migration: 027_property_enquiries.sql
-- Description: Property enquiry system — stores member enquiries for properties

CREATE TABLE IF NOT EXISTS public.property_enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    enquirer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    move_in_date DATE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_enquiries_property_id ON public.property_enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_enquiries_enquirer_id ON public.property_enquiries(enquirer_id);
CREATE INDEX IF NOT EXISTS idx_property_enquiries_status ON public.property_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_enquiries_created_at ON public.property_enquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.property_enquiries ENABLE ROW LEVEL SECURITY;

-- Members can view their own enquiries
CREATE POLICY "Members view own enquiries"
    ON public.property_enquiries FOR SELECT
    USING (enquirer_id = auth.uid());

-- Property owners can view enquiries on their properties
CREATE POLICY "Property owners view enquiries"
    ON public.property_enquiries FOR SELECT
    USING (
        property_id IN (
            SELECT id FROM public.properties WHERE owner_id = auth.uid()
        )
    );

-- Authenticated users can insert (guest enquiries stored without enquirer_id)
CREATE POLICY "Authenticated users can enquire"
    ON public.property_enquiries FOR INSERT
    WITH CHECK (true);

-- Property owners can update status (mark as read, responded, etc.)
CREATE POLICY "Property owners update enquiry status"
    ON public.property_enquiries FOR UPDATE
    USING (
        property_id IN (
            SELECT id FROM public.properties WHERE owner_id = auth.uid()
        )
    );
