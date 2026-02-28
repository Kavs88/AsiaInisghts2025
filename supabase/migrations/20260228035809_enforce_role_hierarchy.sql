CREATE OR REPLACE FUNCTION public.enforce_role_security()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id    UUID;
  caller_role  TEXT;
  caller_rank  INT;
  old_rank     INT;
  new_rank     INT;
BEGIN
  IF NEW.role = OLD.role THEN
    RETURN NEW;
  END IF;

  caller_id := auth.uid();

  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT role INTO caller_role FROM public.users WHERE id = caller_id;

  caller_rank := CASE caller_role
    WHEN 'founder'    THEN 4
    WHEN 'superadmin' THEN 3
    WHEN 'admin'      THEN 2
    WHEN 'user'       THEN 1
    ELSE 0
  END;

  old_rank := CASE OLD.role
    WHEN 'founder'    THEN 4
    WHEN 'superadmin' THEN 3
    WHEN 'admin'      THEN 2
    WHEN 'user'       THEN 1
    ELSE 0
  END;

  new_rank := CASE NEW.role
    WHEN 'founder'    THEN 4
    WHEN 'superadmin' THEN 3
    WHEN 'admin'      THEN 2
    WHEN 'user'       THEN 1
    ELSE 0
  END;

  -- Rule 4: Self-modification blocked
  IF caller_id = OLD.id THEN
    RAISE EXCEPTION 'Users cannot modify their own role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 3: Founder immutable
  IF OLD.role = 'founder' THEN
    RAISE EXCEPTION 'Founder role cannot be modified'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 1: Caller must have strictly higher rank than target's current role
  IF caller_rank <= old_rank THEN
    RAISE EXCEPTION 'Insufficient authority to modify this user''s role'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 2: Caller rank must be >= new role being assigned
  IF caller_rank < new_rank THEN
    RAISE EXCEPTION 'Cannot assign a role equal to or higher than your own'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Rule 5: Audit log
  INSERT INTO public.role_change_audit
    (changed_user_id, old_role, new_role, changed_by, changed_by_role)
  VALUES
    (OLD.id, OLD.role, NEW.role, caller_id, caller_role);

  RETURN NEW;
END;
$$;
