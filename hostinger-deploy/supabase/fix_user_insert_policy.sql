-- Fix: Allow users to insert their own user record during signup
-- This policy allows authenticated users to create their own user record

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create policy to allow users to insert their own record
CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Also allow users to insert if they're creating their own record
-- This handles the signup flow where a user creates their profile
CREATE POLICY "Users can create their own profile" ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;





