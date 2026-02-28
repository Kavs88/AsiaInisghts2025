-- Harden role changes at the database level

CREATE OR REPLACE FUNCTION public.enforce_role_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_id UUID;
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_role_security_trigger ON public.users;

CREATE TRIGGER users_role_security_trigger
  BEFORE UPDATE OF role ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_security();
