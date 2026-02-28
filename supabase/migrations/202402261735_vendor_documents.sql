-- Sunday Market Platform - Document Metadata Extension
-- Adds support for AI-extracted document metadata and reminders

-- Document Types table (e.g., 'Contract', 'Invoice', 'License')
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Documents table
CREATE TABLE IF NOT EXISTS public.vendor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    name TEXT NOT NULL,
    extracted_metadata JSONB, -- Stores AI-extracted details (e.g., expiry dates, provider name)
    expiry_date DATE,
    renewal_reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed document types
INSERT INTO public.document_types (name) VALUES 
('Partner Agreement'),
('Business License'),
('Marketing Material'),
('Insurance Certificate'),
('Invoice')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Vendors can manage their own documents" ON public.vendor_documents
    FOR ALL USING (
        vendor_id IN (
            SELECT id FROM public.vendors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all documents" ON public.vendor_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger for updated_at
CREATE TRIGGER update_vendor_documents_updated_at
    BEFORE UPDATE ON public.vendor_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
