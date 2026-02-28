-- ============================================================
-- Role change audit log table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_change_audit (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_user_id UUID       NOT NULL,
  old_role       TEXT        NOT NULL,
  new_role       TEXT        NOT NULL,
  changed_by     UUID        NOT NULL,
  changed_by_role TEXT       NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.role_change_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view audit log" ON public.role_change_audit
  FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

-- ============================================================
-- Replace enforce_role_security() with audit logging
-- ============================================================

CREATE OR REPLACE FUNCTION public.enforce_role_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id   UUID;
  caller_role TEXT;
BEGIN
  -- No role change — nothing to enforce
  IF NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;

  caller_id := auth.uid();
  SELECT role INTO caller_role FROM public.users WHERE id = caller_id;

  -- Rule 1: Users cannot update their own role
  IF caller_id = OLD.id THEN
    RAISE EXCEPTION 'Users cannot modify their own role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 2: Only platform admins can change roles
  IF NOT public.is_platform_admin(caller_id) THEN
    RAISE EXCEPTION 'Only platform admins can modify user roles'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 3: Founder cannot be demoted
  IF OLD.role = 'founder' THEN
    RAISE EXCEPTION 'Founder role cannot be modified'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 4: Only superadmins (or founders) can assign the superadmin role
  IF NEW.role = 'superadmin' AND caller_role NOT IN ('superadmin', 'founder') THEN
    RAISE EXCEPTION 'Only superadmins can assign the superadmin role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Audit log insert (after all validation passes)
  INSERT INTO public.role_change_audit
    (changed_user_id, old_role, new_role, changed_by, changed_by_role)
  VALUES
    (OLD.id, OLD.role, NEW.role, caller_id, caller_role);

  RETURN NEW;
END;
$$;
