-- Fix incorrect column reference in is_platform_admin

CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN
    EXISTS (
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
