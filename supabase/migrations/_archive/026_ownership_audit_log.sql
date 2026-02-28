-- Migration: 026_ownership_audit_log.sql
-- Description: Creates the ownership_changes table for auditing administrative reassignment.

CREATE TABLE IF NOT EXISTS public.ownership_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'business', 'event', 'property'
    entity_id UUID NOT NULL,
    previous_owner_id UUID,
    new_owner_id UUID NOT NULL,
    changed_by UUID, -- Nullable to handle background/service actions
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ownership_changes_entity_id ON public.ownership_changes(entity_id);
CREATE INDEX IF NOT EXISTS idx_ownership_changes_changed_by ON public.ownership_changes(changed_by);

-- Enable RLS
ALTER TABLE public.ownership_changes ENABLE ROW LEVEL SECURITY;

-- Policy: Admin only access
CREATE POLICY "Admins can view audit logs" ON public.ownership_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_user', 'superadmin', 'founder')
        )
    );
