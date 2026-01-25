-- ============================================
-- FINALIZE VENDORS TABLE RLS: ADMIN-ONLY INSERT
-- ============================================
-- 
-- Purpose: Ensure ONLY admins can create vendors in the vendors table
-- 
-- This script:
-- 1. Removes all non-admin INSERT policies on vendors table
-- 2. Ensures admin INSERT policy exists
-- 3. Does NOT modify SELECT or UPDATE policies
-- 4. Service role access remains intact (bypasses RLS by default)
--
-- ============================================
-- STEP 1: REMOVE ALL NON-ADMIN INSERT POLICIES
-- ============================================
-- 
-- Drop any policies that allow non-admin users to insert vendors.
-- These policies may have been created for user signup flows, but
-- according to requirements, only admins should create vendors.

-- Drop policy allowing users to create their own vendor profile
DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;

-- Drop policy allowing vendors to insert their own profile
DROP POLICY IF EXISTS "Vendors can insert own vendor profile" ON public.vendors;

-- Drop any other potential non-admin insert policies
-- (These may not exist, but we drop them to be safe)
DROP POLICY IF EXISTS "Vendors can insert own record" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can create vendors" ON public.vendors;
DROP POLICY IF EXISTS "Public can create vendors" ON public.vendors;

-- ============================================
-- STEP 2: ENSURE ADMIN INSERT POLICY EXISTS
-- ============================================
-- 
-- Create or replace the admin-only INSERT policy.
-- This policy uses the is_admin() function which checks if the
-- current user has admin role in the users table.
-- 
-- Note: The is_admin() function uses SECURITY DEFINER, so it
-- bypasses RLS when checking the users table (no circular dependency).

DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
CREATE POLICY "Admins can insert vendors" ON public.vendors
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- STEP 3: VERIFICATION
-- ============================================
-- 
-- Query to verify the final state of INSERT policies.
-- After running this script, you should see:
-- - Only "Admins can insert vendors" policy for INSERT operations
-- - SELECT and UPDATE policies remain unchanged

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
WHERE schemaname = 'public'
    AND tablename = 'vendors'
    AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================
-- WHAT WILL BREAK?
-- ============================================
-- 
-- ⚠️ BREAKING CHANGES:
-- 
-- 1. User Self-Registration Flow
--    - Any code that allows users to create their own vendor profile
--      during signup will fail with RLS policy violation
--    - Error: "new row violates row-level security policy"
--    - Solution: Users must request vendor creation through admin
--      or use a change request system
-- 
-- 2. Direct Vendor Creation from Frontend
--    - Any frontend forms that allow non-admin users to create vendors
--      will be blocked
--    - Solution: Use service role client in server actions, or require
--      admin authentication
-- 
-- ✅ WHAT STILL WORKS:
-- 
-- 1. Admin Vendor Creation
--    - Admins can create vendors through Supabase client (if authenticated
--      as admin) or service role client
-- 
-- 2. Service Role Operations
--    - Service role client (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS
--      by default, so server-side operations continue to work
-- 
-- 3. SELECT Operations
--    - All existing SELECT policies remain unchanged
--    - Public can still view active vendors
--    - Vendors can still view their own profile
--    - Admins can still view all vendors
-- 
-- 4. UPDATE Operations
--    - All existing UPDATE policies remain unchanged
--    - Vendors can still update their own profile (if policy exists)
--    - Admins can still update all vendors
-- 
-- ============================================
-- MIGRATION PATH
-- ============================================
-- 
-- If you need to migrate existing user signup flows:
-- 
-- Option 1: Use Service Role in Server Actions
--   - Create a server action that uses service role client
--   - Validate user input server-side
--   - Create vendor using service role (bypasses RLS)
-- 
-- Option 2: Use Change Request System
--   - Users submit vendor creation requests
--   - Admins approve and create vendors
--   - This aligns with the change request pattern already in place
-- 
-- Option 3: Admin-Only Creation Flow
--   - Remove vendor creation from user signup
--   - Require users to contact admin for vendor account
--   - Admin creates vendor after verification
-- 
-- ============================================


