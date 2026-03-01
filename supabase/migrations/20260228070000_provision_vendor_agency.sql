-- ============================================================
-- provision_vendor_agency()
--
-- Atomically creates an Agency + owner membership for a newly
-- signed-up vendor, bypassing the RLS chicken-and-egg problem:
--
--   A user needs to be an agency owner to INSERT into agencies /
--   agency_members, but can't become an owner until those rows
--   exist. A SECURITY DEFINER function runs as the function
--   owner (postgres), so it bypasses RLS entirely.
--
-- Called by:
--   • signUpVendor() in lib/auth/auth.ts (self-signup path)
--   • Edge Function create-vendor-account (admin path, as fallback)
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
  -- Security: only the user themselves or a platform admin may call this
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

  -- Make the user the owner of their new agency
  INSERT INTO public.agency_members (agency_id, user_id, role)
  VALUES (v_agency_id, p_user_id, 'owner');

  RETURN v_agency_id;
END;
$$;
