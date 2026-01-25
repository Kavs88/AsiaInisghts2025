-- ============================================
-- VENDOR RLS POLICY AUDIT & CLEANUP SCRIPT
-- ============================================
-- 
-- PURPOSE: Ensure vendors cannot UPDATE under any condition
--          and remove conflicting policies
--
-- ⚠️ READ THIS BEFORE RUNNING:
-- 1. This script will REMOVE vendor/user UPDATE policies
-- 2. This script will REMOVE user INSERT policy (optional, see below)
-- 3. Test in development first
-- 4. Review the audit report: VENDOR_RLS_AUDIT_REPORT.md
--
-- ============================================

-- ============================================
-- STEP 1: AUDIT CURRENT POLICIES
-- ============================================

-- Show all current policies for vendors table
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN qual::text
        ELSE 'null'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN with_check::text
        ELSE 'null'
    END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'vendors'
ORDER BY cmd, policyname;

-- ============================================
-- STEP 2: REMOVE VENDOR/USER UPDATE POLICIES
-- ============================================
-- These policies allow vendors to directly update their profile
-- MUST BE REMOVED to enforce change request system

-- Remove all possible vendor UPDATE policy variations
DROP POLICY IF EXISTS "Vendors can update own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update their own profile" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendor profile" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendors;

-- ============================================
-- STEP 3: REMOVE USER INSERT POLICY (OPTIONAL)
-- ============================================
-- ⚠️ RISK ASSESSMENT:
-- 
-- REMOVING THIS POLICY WILL:
-- - Prevent users from creating their own vendor profiles
-- - Enforce admin-only vendor creation (per requirements)
-- - May break vendor signup/registration flow if it exists
--
-- KEEPING THIS POLICY WILL:
-- - Allow users to create vendor profiles during signup
-- - Conflict with requirement: "Admin is the sole authority that can Create vendors"
--
-- DECISION REQUIRED: Uncomment the next section if you want admin-only creation

-- Uncomment these lines to enforce admin-only vendor creation:
-- DROP POLICY IF EXISTS "Users can create their own vendor profile" ON public.vendors;
-- DROP POLICY IF EXISTS "Vendors can insert own vendor profile" ON public.vendors;

-- ============================================
-- STEP 4: VERIFY REMAINING POLICIES
-- ============================================

-- After cleanup, verify these policies exist:
-- ✅ "Admins can update all vendors" (UPDATE - admin only)
-- ✅ "Admins can insert vendors" (INSERT - admin only)
-- ✅ "Admins can view all vendors" (SELECT - admin only)
-- ✅ "Admins can delete vendors" (DELETE - admin only)
-- ✅ "Service role can manage vendors" (ALL - service role only)
-- ✅ "Vendors are publicly viewable" (SELECT - public)
-- ✅ "Vendors can view own profile" (SELECT - vendor can view own)

-- Final verification query
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'UPDATE' AND policyname LIKE '%Admin%' THEN '✅ Admin UPDATE - CORRECT'
        WHEN cmd = 'UPDATE' AND policyname LIKE '%Service%' THEN '✅ Service Role UPDATE - CORRECT'
        WHEN cmd = 'UPDATE' THEN '❌ VENDOR UPDATE POLICY FOUND - REMOVE THIS!'
        WHEN cmd = 'INSERT' AND policyname LIKE '%Admin%' THEN '✅ Admin INSERT - CORRECT'
        WHEN cmd = 'INSERT' AND policyname LIKE '%User%' THEN '⚠️ User INSERT - Review if needed'
        WHEN cmd = 'INSERT' AND policyname LIKE '%Service%' THEN '✅ Service Role INSERT - CORRECT'
        WHEN cmd = 'SELECT' THEN '✅ SELECT policy - Review individually'
        WHEN cmd = 'DELETE' AND policyname LIKE '%Admin%' THEN '✅ Admin DELETE - CORRECT'
        ELSE 'Review this policy'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'vendors'
ORDER BY cmd, policyname;

-- ============================================
-- STEP 5: SECURITY VERIFICATION
-- ============================================

-- Verify NO vendor UPDATE policies exist
DO $$
DECLARE
    vendor_update_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO vendor_update_count
    FROM pg_policies
    WHERE schemaname = 'public'
        AND tablename = 'vendors'
        AND cmd = 'UPDATE'
        AND policyname NOT LIKE '%Admin%'
        AND policyname NOT LIKE '%Service%';
    
    IF vendor_update_count > 0 THEN
        RAISE WARNING '⚠️ FOUND % VENDOR UPDATE POLICIES - VENDORS CAN STILL UPDATE!', vendor_update_count;
    ELSE
        RAISE NOTICE '✅ SECURE: No vendor UPDATE policies found. Vendors cannot update.';
    END IF;
END $$;

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- After running this script:
-- 1. Vendors CANNOT UPDATE their profiles (enforced)
-- 2. Only admins can UPDATE vendors
-- 3. Service role can UPDATE (for server-side operations)
-- 4. Review INSERT policies based on your requirements
-- 5. All SELECT policies remain intact
--
-- Next steps:
-- - Test vendor profile edit page (should submit requests, not update)
-- - Test admin approval flow
-- - Verify change request system works correctly


