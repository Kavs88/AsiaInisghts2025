-- Vendor Change Requests System
-- This schema implements a request-based system where vendors can request profile changes
-- and only admins can approve and apply them to the vendors table

-- ============================================
-- VENDOR CHANGE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.vendor_change_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Requested changes (stored as JSONB for flexibility)
    -- Only includes fields that vendors are allowed to request changes for
    requested_changes JSONB NOT NULL,
    
    -- Request metadata
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'modified')),
    admin_notes TEXT,
    reviewed_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    
    -- Note: Unique constraint for pending requests is handled via application logic
    -- PostgreSQL versions may vary in support for partial unique constraints with NULLS
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_vendor_change_requests_vendor_id ON public.vendor_change_requests(vendor_id);
CREATE INDEX idx_vendor_change_requests_status ON public.vendor_change_requests(status);
CREATE INDEX idx_vendor_change_requests_requested_by ON public.vendor_change_requests(requested_by_user_id);
CREATE INDEX idx_vendor_change_requests_created_at ON public.vendor_change_requests(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.vendor_change_requests ENABLE ROW LEVEL SECURITY;

-- Vendors can view their own requests
CREATE POLICY "Vendors can view own requests"
    ON public.vendor_change_requests FOR SELECT
    USING (
        requested_by_user_id = current_user_id()
        OR vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        OR is_admin(current_user_id())
    );

-- Vendors can create requests for their own vendor profile
CREATE POLICY "Vendors can create own requests"
    ON public.vendor_change_requests FOR INSERT
    WITH CHECK (
        vendor_id IN (SELECT id FROM public.vendors WHERE user_id = current_user_id())
        AND requested_by_user_id = current_user_id()
    );

-- Vendors can update their own pending requests (to cancel or modify before review)
CREATE POLICY "Vendors can update own pending requests"
    ON public.vendor_change_requests FOR UPDATE
    USING (
        requested_by_user_id = current_user_id()
        AND status = 'pending'
    )
    WITH CHECK (
        requested_by_user_id = current_user_id()
        AND status = 'pending'
    );

-- Vendors can delete their own pending requests
CREATE POLICY "Vendors can delete own pending requests"
    ON public.vendor_change_requests FOR DELETE
    USING (
        requested_by_user_id = current_user_id()
        AND status = 'pending'
    );

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
    ON public.vendor_change_requests FOR SELECT
    USING (is_admin(current_user_id()));

-- Admins can update all requests (to approve/reject/modify)
CREATE POLICY "Admins can update all requests"
    ON public.vendor_change_requests FOR UPDATE
    USING (is_admin(current_user_id()));

-- Admins can delete requests
CREATE POLICY "Admins can delete requests"
    ON public.vendor_change_requests FOR DELETE
    USING (is_admin(current_user_id()));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_vendor_change_requests_updated_at 
    BEFORE UPDATE ON public.vendor_change_requests
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO APPLY APPROVED REQUEST
-- ============================================

-- Function to apply approved vendor change request to vendors table
-- This function should only be called by admins via server actions
CREATE OR REPLACE FUNCTION apply_vendor_change_request(
    p_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_request RECORD;
    v_changes JSONB;
    v_update_data JSONB := '{}'::JSONB;
BEGIN
    -- Get the request
    SELECT * INTO v_request
    FROM public.vendor_change_requests
    WHERE id = p_request_id
        AND status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or not approved: %', p_request_id;
    END IF;
    
    -- Extract changes from JSONB
    v_changes := v_request.requested_changes;
    
    -- Build update data (only include fields that exist in vendors table)
    -- Note: slug, is_verified, is_active should NOT be in requested_changes
    -- These are admin-only fields
    
    IF v_changes ? 'name' THEN
        v_update_data := v_update_data || jsonb_build_object('name', v_changes->>'name');
    END IF;
    
    IF v_changes ? 'tagline' THEN
        v_update_data := v_update_data || jsonb_build_object('tagline', v_changes->>'tagline');
    END IF;
    
    IF v_changes ? 'bio' THEN
        v_update_data := v_update_data || jsonb_build_object('bio', v_changes->>'bio');
    END IF;
    
    IF v_changes ? 'logo_url' THEN
        v_update_data := v_update_data || jsonb_build_object('logo_url', v_changes->>'logo_url');
    END IF;
    
    IF v_changes ? 'hero_image_url' THEN
        v_update_data := v_update_data || jsonb_build_object('hero_image_url', v_changes->>'hero_image_url');
    END IF;
    
    IF v_changes ? 'category' THEN
        v_update_data := v_update_data || jsonb_build_object('category', v_changes->>'category');
    END IF;
    
    IF v_changes ? 'contact_email' THEN
        v_update_data := v_update_data || jsonb_build_object('contact_email', v_changes->>'contact_email');
    END IF;
    
    IF v_changes ? 'contact_phone' THEN
        v_update_data := v_update_data || jsonb_build_object('contact_phone', v_changes->>'contact_phone');
    END IF;
    
    IF v_changes ? 'website_url' THEN
        v_update_data := v_update_data || jsonb_build_object('website_url', v_changes->>'website_url');
    END IF;
    
    IF v_changes ? 'instagram_handle' THEN
        v_update_data := v_update_data || jsonb_build_object('instagram_handle', v_changes->>'instagram_handle');
    END IF;
    
    IF v_changes ? 'facebook_url' THEN
        v_update_data := v_update_data || jsonb_build_object('facebook_url', v_changes->>'facebook_url');
    END IF;
    
    IF v_changes ? 'delivery_available' THEN
        v_update_data := v_update_data || jsonb_build_object('delivery_available', (v_changes->>'delivery_available')::boolean);
    END IF;
    
    IF v_changes ? 'pickup_available' THEN
        v_update_data := v_update_data || jsonb_build_object('pickup_available', (v_changes->>'pickup_available')::boolean);
    END IF;
    
    -- Apply update to vendors table
    -- This will be executed with admin privileges via service role client
    UPDATE public.vendors
    SET 
        name = COALESCE((v_update_data->>'name')::TEXT, name),
        tagline = COALESCE((v_update_data->>'tagline')::TEXT, tagline),
        bio = COALESCE((v_update_data->>'bio')::TEXT, bio),
        logo_url = COALESCE((v_update_data->>'logo_url')::TEXT, logo_url),
        hero_image_url = COALESCE((v_update_data->>'hero_image_url')::TEXT, hero_image_url),
        category = COALESCE((v_update_data->>'category')::TEXT, category),
        contact_email = COALESCE((v_update_data->>'contact_email')::TEXT, contact_email),
        contact_phone = COALESCE((v_update_data->>'contact_phone')::TEXT, contact_phone),
        website_url = COALESCE((v_update_data->>'website_url')::TEXT, website_url),
        instagram_handle = COALESCE((v_update_data->>'instagram_handle')::TEXT, instagram_handle),
        facebook_url = COALESCE((v_update_data->>'facebook_url')::TEXT, facebook_url),
        delivery_available = COALESCE((v_update_data->>'delivery_available')::boolean, delivery_available),
        pickup_available = COALESCE((v_update_data->>'pickup_available')::boolean, pickup_available),
        updated_at = NOW()
    WHERE id = v_request.vendor_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANTS
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_change_requests TO authenticated;
GRANT EXECUTE ON FUNCTION apply_vendor_change_request(UUID) TO authenticated;

