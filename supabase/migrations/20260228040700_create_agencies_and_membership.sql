CREATE TABLE public.agencies (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        NOT NULL UNIQUE,
  created_by UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.agency_members (
  agency_id  UUID  NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id    UUID  NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role       TEXT  NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (agency_id, user_id),
  CONSTRAINT agency_members_role_check
    CHECK (role IN ('owner', 'manager', 'editor', 'member'))
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;

-- agencies: members can view agencies they belong to
CREATE POLICY "Agency members can view their agency"
  ON public.agencies
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members
      WHERE agency_id = agencies.id
        AND user_id = auth.uid()
    )
  );

-- agencies: platform admins can manage all agencies
CREATE POLICY "Platform admins can manage agencies"
  ON public.agencies
  FOR ALL
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- agency_members: members can view membership for their agencies
CREATE POLICY "Agency members can view membership"
  ON public.agency_members
  FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
    )
  );

-- agency_members: only owners (or platform admins) can insert members
CREATE POLICY "Agency owners can insert members"
  ON public.agency_members
  FOR INSERT
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  );

-- agency_members: only owners (or platform admins) can update members
CREATE POLICY "Agency owners can update members"
  ON public.agency_members
  FOR UPDATE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  )
  WITH CHECK (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  );

-- agency_members: only owners (or platform admins) can delete members
CREATE POLICY "Agency owners can delete members"
  ON public.agency_members
  FOR DELETE
  USING (
    public.is_platform_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.agency_members am
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
        AND am.role = 'owner'
    )
  );
