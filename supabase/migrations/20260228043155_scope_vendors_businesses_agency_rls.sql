-- Add agency_id to vendors and businesses (nullable — NOT NULL applied after backfill)

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_vendors_agency_id    ON public.vendors(agency_id);
CREATE INDEX IF NOT EXISTS idx_businesses_agency_id ON public.businesses(agency_id);

-- ============================================================
-- RLS: vendors — agency-scoped access
-- ============================================================

-- Agency members can view vendors belonging to their agency
DROP POLICY IF EXISTS "Agency members can view agency vendors" ON public.vendors;
CREATE POLICY "Agency members can view agency vendors"
  ON public.vendors
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = vendors.agency_id
        AND am.user_id = auth.uid()
    )
  );

-- Agency owners and managers can insert vendors into their agency
DROP POLICY IF EXISTS "Agency managers can insert vendors" ON public.vendors;
CREATE POLICY "Agency managers can insert vendors"
  ON public.vendors
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = vendors.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  );

-- Agency owners and managers can update vendors in their agency
DROP POLICY IF EXISTS "Agency managers can update vendors" ON public.vendors;
CREATE POLICY "Agency managers can update vendors"
  ON public.vendors
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = vendors.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = vendors.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  );

-- Agency owners can delete vendors in their agency
DROP POLICY IF EXISTS "Agency owners can delete vendors" ON public.vendors;
CREATE POLICY "Agency owners can delete vendors"
  ON public.vendors
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = vendors.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  );

-- ============================================================
-- RLS: businesses — agency-scoped access
-- ============================================================

-- Agency members can view businesses belonging to their agency
DROP POLICY IF EXISTS "Agency members can view agency businesses" ON public.businesses;
CREATE POLICY "Agency members can view agency businesses"
  ON public.businesses
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = businesses.agency_id
        AND am.user_id = auth.uid()
    )
  );

-- Agency owners and managers can insert businesses into their agency
DROP POLICY IF EXISTS "Agency managers can insert businesses" ON public.businesses;
CREATE POLICY "Agency managers can insert businesses"
  ON public.businesses
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = businesses.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  );

-- Agency owners and managers can update businesses in their agency
DROP POLICY IF EXISTS "Agency managers can update businesses" ON public.businesses;
CREATE POLICY "Agency managers can update businesses"
  ON public.businesses
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = businesses.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = businesses.agency_id
        AND am.user_id = auth.uid()
        AND am.role IN ('owner', 'manager')
    )
  );

-- Agency owners can delete businesses in their agency
DROP POLICY IF EXISTS "Agency owners can delete businesses" ON public.businesses;
CREATE POLICY "Agency owners can delete businesses"
  ON public.businesses
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = businesses.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  );
