-- Add RLS Policies for Admin to Insert Users and Vendors
-- This allows admins to create user accounts and vendor profiles

-- ============================================
-- ADMIN INSERT POLICIES FOR USERS TABLE
-- ============================================

-- Allow admins to insert user records
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ADMIN INSERT POLICIES FOR VENDORS TABLE
-- ============================================

-- Allow admins to insert vendor records
DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
CREATE POLICY "Admins can insert vendors" ON public.vendors
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'vendors')
  AND policyname LIKE '%Admin%'
  AND cmd = 'INSERT'
ORDER BY tablename, policyname;





