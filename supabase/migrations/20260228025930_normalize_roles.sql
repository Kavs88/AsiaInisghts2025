-- Drop existing constraint first so legacy role values can be rewritten
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

UPDATE public.users
SET role = 'user'
WHERE role IN ('customer', 'vendor');

UPDATE public.users
SET role = 'superadmin'
WHERE role = 'super_user';
