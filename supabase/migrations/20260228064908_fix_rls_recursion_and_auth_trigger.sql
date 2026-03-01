-- ============================================================
-- FIX 1: handle_new_user() trigger
--
-- The trigger was inserting role='customer', which no longer
-- exists in the users_role_check constraint after normalize_roles.
-- New signups were failing with a constraint violation (406).
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user'  -- was 'customer', which was removed by normalize_roles migration
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- FIX 2: Break RLS infinite recursion on agency_members
--
-- Root cause: the agency_members SELECT policy contained:
--   EXISTS (SELECT 1 FROM public.agency_members am WHERE ...)
-- Postgres evaluates this by SELECTing from agency_members,
-- which triggers the SELECT policy again → infinite recursion.
-- The same cascade hit vendors/businesses policies that also
-- query agency_members (triggering agency_members RLS → recurse).
--
-- Fix: introduce two SECURITY DEFINER helper functions that
-- query agency_members as the function owner, bypassing RLS
-- entirely. All policies that previously did self-referential
-- agency_members lookups are rewritten to use these helpers.
-- ============================================================

-- Returns every agency_id the current user is a member of.
-- SECURITY DEFINER bypasses RLS on agency_members, breaking the loop.
CREATE OR REPLACE FUNCTION public.get_my_agency_ids()
  RETURNS UUID[]
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(agency_id), '{}')
  FROM public.agency_members
  WHERE user_id = auth.uid()
$$;

-- Returns the current user's role in a specific agency.
-- NULL if the user is not a member.
CREATE OR REPLACE FUNCTION public.get_my_agency_role(p_agency_id UUID)
  RETURNS TEXT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT role
  FROM public.agency_members
  WHERE agency_id = p_agency_id
    AND user_id = auth.uid()
  LIMIT 1
$$;


-- ---- agencies table policies --------------------------------

-- Replace the agencies SELECT policy: use get_my_agency_ids()
-- instead of querying agency_members directly.
DROP POLICY IF EXISTS "Agency members can view their agency" ON public.agencies;
CREATE POLICY "Agency members can view their agency"
  ON public.agencies
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR id = ANY(public.get_my_agency_ids())
  );


-- ---- agency_members table policies -------------------------

-- SELECT: was self-referential → now uses get_my_agency_ids()
DROP POLICY IF EXISTS "Agency members can view membership" ON public.agency_members;
CREATE POLICY "Agency members can view membership"
  ON public.agency_members
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );

-- INSERT: was self-referential → now uses get_my_agency_role()
DROP POLICY IF EXISTS "Agency owners can insert members" ON public.agency_members;
CREATE POLICY "Agency owners can insert members"
  ON public.agency_members
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );

-- UPDATE: was self-referential → now uses get_my_agency_role()
DROP POLICY IF EXISTS "Agency owners can update members" ON public.agency_members;
CREATE POLICY "Agency owners can update members"
  ON public.agency_members
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );

-- DELETE: was self-referential → now uses get_my_agency_role()
DROP POLICY IF EXISTS "Agency owners can delete members" ON public.agency_members;
CREATE POLICY "Agency owners can delete members"
  ON public.agency_members
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );


-- ---- vendors table SELECT policy ---------------------------
-- Replace EXISTS(SELECT 1 FROM agency_members ...) with
-- agency_id = ANY(get_my_agency_ids()) to avoid the secondary
-- RLS evaluation that also triggered the recursion.
DROP POLICY IF EXISTS "Agency members can view agency vendors" ON public.vendors;
CREATE POLICY "Agency members can view agency vendors"
  ON public.vendors
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );

-- INSERT / UPDATE / DELETE policies on vendors also used
-- EXISTS(SELECT 1 FROM agency_members ...) for role checks.
-- Rewrite to use get_my_agency_role() instead.
DROP POLICY IF EXISTS "Agency managers can insert vendors" ON public.vendors;
CREATE POLICY "Agency managers can insert vendors"
  ON public.vendors
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  );

DROP POLICY IF EXISTS "Agency managers can update vendors" ON public.vendors;
CREATE POLICY "Agency managers can update vendors"
  ON public.vendors
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  );

DROP POLICY IF EXISTS "Agency owners can delete vendors" ON public.vendors;
CREATE POLICY "Agency owners can delete vendors"
  ON public.vendors
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );


-- ---- businesses table SELECT policy ------------------------
DROP POLICY IF EXISTS "Agency members can view agency businesses" ON public.businesses;
CREATE POLICY "Agency members can view agency businesses"
  ON public.businesses
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );

DROP POLICY IF EXISTS "Agency managers can insert businesses" ON public.businesses;
CREATE POLICY "Agency managers can insert businesses"
  ON public.businesses
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  );

DROP POLICY IF EXISTS "Agency managers can update businesses" ON public.businesses;
CREATE POLICY "Agency managers can update businesses"
  ON public.businesses
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) IN ('owner', 'manager')
  );

DROP POLICY IF EXISTS "Agency owners can delete businesses" ON public.businesses;
CREATE POLICY "Agency owners can delete businesses"
  ON public.businesses
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );
