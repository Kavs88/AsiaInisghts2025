-- ============================================================
-- 1️⃣ Unified Platform Admin Authority
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
      AND role IN ('admin', 'superadmin', 'founder')
  )
  OR EXISTS (
    SELECT 1
    FROM public.super_users su
    WHERE su.uid = user_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT public.is_platform_admin(user_id);
$$;

-- ============================================================
-- 2️⃣ Enforce strict role constraint
-- ============================================================

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('user', 'landlord', 'admin', 'superadmin', 'founder'));
