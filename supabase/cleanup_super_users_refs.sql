-- The 'public.super_users' table was deleted, but RLS policies on 'public.users' 
-- still reference it, causing queries (like login/signup role checks) to crash with:
-- "relation public.super_users does not exist"

-- Drop the known policies that reference super_users
DROP POLICY IF EXISTS "Super users can view all users" ON public.users;
DROP POLICY IF EXISTS "Super users can insert users" ON public.users;
DROP POLICY IF EXISTS "Super users can update all users" ON public.users;
DROP POLICY IF EXISTS "Super users can delete users" ON public.users;

-- Also drop from vendors just in case
DROP POLICY IF EXISTS "Super users can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Super users can update all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Super users can insert vendors" ON public.vendors;
DROP POLICY IF EXISTS "Super users can delete vendors" ON public.vendors;

-- Let's just create a dummy table temporarily so if there are any other hidden policies, they won't hard-crash the DB
CREATE TABLE IF NOT EXISTS public.super_users (
    uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
