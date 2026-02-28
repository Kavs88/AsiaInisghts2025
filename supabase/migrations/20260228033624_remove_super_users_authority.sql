-- Simplify platform admin logic to role-based only

CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id
    AND role IN ('admin', 'superadmin', 'founder')
  );
$$;

DROP TABLE IF EXISTS public.super_users;
