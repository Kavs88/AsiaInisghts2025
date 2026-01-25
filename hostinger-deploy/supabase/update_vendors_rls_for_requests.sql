-- Update Vendors Table RLS to Prevent Direct Vendor Updates
-- Vendors must now use the change request system instead of direct updates

-- ============================================
-- REMOVE VENDOR UPDATE POLICY
-- ============================================

-- ============================================
-- REMOVE VENDOR/USER UPDATE POLICIES
-- ============================================

-- Drop the existing policies that allow vendors/users to update their own profile
-- These must be removed so vendors can only request changes, not apply them directly
DROP POLICY IF EXISTS "Vendors can update own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendor profile" ON public.vendors;

-- ============================================
-- REMOVE USER INSERT POLICY
-- ============================================

-- Drop the policy that allows users to create their own vendor profile
-- According to requirements: "Admin is the sole authority that can Create vendors"
DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can insert own vendor profile" ON public.vendors;

-- ============================================
-- VERIFICATION
-- ============================================

-- After running this script, verify that:
-- 1. "Users can update their own vendor profile" is removed
-- 2. "Admins can update all vendors" still exists (for admin updates)
-- 3. "Vendors can view own profile" still exists (for vendors to view their profile)

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'vendors'
ORDER BY policyname;

