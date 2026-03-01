-- ============================================================
-- PENDING MIGRATIONS — run this entire script in the
-- Supabase Dashboard › SQL Editor › New query › Run
-- ============================================================
-- Migration 1: 20260228064908_fix_rls_recursion_and_auth_trigger
-- Migration 2: 20260228070000_provision_vendor_agency
-- ============================================================


-- ============================================================
-- [1/2] FIX: handle_new_user() trigger
--
-- Was inserting role='customer' which no longer exists after
-- normalize_roles migration. New signups were 406-ing.
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
-- [1/2] FIX: Break RLS infinite recursion on agency_members
--
-- Two SECURITY DEFINER helpers query agency_members as the
-- function owner, bypassing RLS. All self-referential policies
-- are rewritten to use these helpers instead.
-- ============================================================

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


-- ---- agencies policies ----

DROP POLICY IF EXISTS "Agency members can view their agency" ON public.agencies;
CREATE POLICY "Agency members can view their agency"
  ON public.agencies
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR id = ANY(public.get_my_agency_ids())
  );


-- ---- agency_members policies ----

DROP POLICY IF EXISTS "Agency members can view membership" ON public.agency_members;
CREATE POLICY "Agency members can view membership"
  ON public.agency_members
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );

DROP POLICY IF EXISTS "Agency owners can insert members" ON public.agency_members;
CREATE POLICY "Agency owners can insert members"
  ON public.agency_members
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );

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

DROP POLICY IF EXISTS "Agency owners can delete members" ON public.agency_members;
CREATE POLICY "Agency owners can delete members"
  ON public.agency_members
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR public.get_my_agency_role(agency_id) = 'owner'
  );


-- ---- vendors policies ----

DROP POLICY IF EXISTS "Agency members can view agency vendors" ON public.vendors;
CREATE POLICY "Agency members can view agency vendors"
  ON public.vendors
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );

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


-- ---- businesses policies ----

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


-- ============================================================
-- [2/2] provision_vendor_agency()
--
-- SECURITY DEFINER RPC — atomically creates an Agency + owner
-- membership for a new vendor, bypassing the RLS chicken-and-egg.
-- Called by signUpVendor() (self-signup) and the Edge Function
-- (admin path fallback).
-- ============================================================

CREATE OR REPLACE FUNCTION public.provision_vendor_agency(
  p_vendor_name TEXT,
  p_user_id     UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_agency_id UUID;
  v_slug      TEXT;
  v_counter   INT := 0;
BEGIN
  -- Only the user themselves or a platform admin may call this
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_platform_admin(auth.uid())
  THEN
    RAISE EXCEPTION 'permission denied: cannot provision agency for another user';
  END IF;

  -- Derive a URL-safe slug from the vendor name
  v_slug := lower(
              trim(
                both '-' from
                regexp_replace(p_vendor_name, '[^a-zA-Z0-9]+', '-', 'g')
              )
            );

  -- Guarantee uniqueness with a numeric suffix
  WHILE EXISTS (SELECT 1 FROM public.agencies WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug    := lower(
                   trim(
                     both '-' from
                     regexp_replace(p_vendor_name, '[^a-zA-Z0-9]+', '-', 'g')
                   )
                 ) || '-' || v_counter::text;
  END LOOP;

  -- Create the agency
  INSERT INTO public.agencies (name, slug, created_by)
  VALUES (p_vendor_name, v_slug, p_user_id)
  RETURNING id INTO v_agency_id;

  -- Make the user the owner
  INSERT INTO public.agency_members (agency_id, user_id, role)
  VALUES (v_agency_id, p_user_id, 'owner');

  RETURN v_agency_id;
END;
$$;
