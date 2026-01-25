-- Fix Conflicting Users Table RLS Policies
-- There are conflicting policies that need to be cleaned up

-- ============================================
-- STEP 1: DROP ALL EXISTING POLICIES
-- ============================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;

-- ============================================
-- STEP 2: CREATE CORRECT POLICIES
-- ============================================

-- Policy 1: Users can view their own profile (for non-admin users)
-- This allows regular users to read their own record
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Policy 2: Admins can view all users (including themselves)
-- This allows admins to read any user record, including their own
-- This is needed for isAdmin() check to work
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 4: Admins can update all users
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Policy 5: Users can insert their own profile (for signup)
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policy 6: Service role can manage users (for server-side operations)
CREATE POLICY "Service role can manage users" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 3: VERIFICATION
-- ============================================

-- Verify policies were created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY cmd, policyname;

-- Expected result:
-- 1. "Users can view their own profile" - SELECT - (id = auth.uid())
-- 2. "Admins can view all users" - SELECT - (EXISTS ...)
-- 3. "Users can update their own profile" - UPDATE - (id = auth.uid())
-- 4. "Admins can update all users" - UPDATE - (EXISTS ...)
-- 5. "Users can insert their own profile" - INSERT - (id = auth.uid())
-- 6. "Service role can manage users" - ALL - (true)





