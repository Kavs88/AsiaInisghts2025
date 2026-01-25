-- ============================================
-- MARKET_DAYS RLS AUDIT & FIX SCRIPT
-- ============================================
-- 
-- This script audits and fixes Row Level Security policies
-- for the market_days table according to security requirements:
--
-- Requirements:
-- 1. Only admins can INSERT, UPDATE, DELETE market days
-- 2. Service role must retain full access (automatic - bypasses RLS)
-- 3. Public users can SELECT only published market days
-- 4. Vendors must have zero write access
--
-- ============================================
-- PART 1: CURRENT POLICY AUDIT
-- ============================================

-- View all current policies on market_days table
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
  AND tablename = 'market_days'
ORDER BY cmd, policyname;

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'market_days';

-- ============================================
-- PART 2: IDENTIFY MISSING/DUPLICATE POLICIES
-- ============================================
--
-- Expected policies:
-- ✅ SELECT: Public users can view published market days (should be 1 policy)
-- ❌ INSERT: Admins only (should be 1 policy)
-- ❌ UPDATE: Admins only (should be 1 policy)
-- ❌ DELETE: Admins only (should be 1 policy)
-- ❌ ALL: Should NOT exist (covers all operations - security risk)
--
-- Check for problematic policies (duplicates, ALL policies)
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'ALL' THEN '⚠️ SECURITY RISK: ALL policies should be removed'
    WHEN cmd = 'SELECT' AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'market_days' AND cmd = 'SELECT') > 1 
      THEN '⚠️ DUPLICATE: Multiple SELECT policies found'
    ELSE 'OK'
  END as issue
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
ORDER BY 
  CASE cmd
    WHEN 'ALL' THEN 0  -- Show ALL policies first (most critical)
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    ELSE 5
  END,
  policyname;

--
-- ============================================
-- PART 3: FIX SCRIPT
-- ============================================

-- Ensure RLS is enabled (should already be enabled)
ALTER TABLE public.market_days ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CLEANUP: Remove duplicate or incorrect policies
-- ============================================
-- 
-- Drop ALL existing policies to ensure clean state
-- We'll recreate only the correct policies below
-- This handles duplicates and "ALL" policies

DROP POLICY IF EXISTS "Published market days are publicly viewable" ON public.market_days;
DROP POLICY IF EXISTS "Admins can insert market days" ON public.market_days;
DROP POLICY IF EXISTS "Admins can update market days" ON public.market_days;
DROP POLICY IF EXISTS "Admins can delete market days" ON public.market_days;

-- Drop any other policies that might exist (catch-all for duplicates or ALL policies)
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'market_days'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.market_days', policy_record.policyname);
  END LOOP;
END $$;

-- ============================================
-- CREATE CORRECT POLICIES
-- ============================================
-- Now create only the policies we need (no duplicates)

-- ============================================
-- SELECT POLICY: Public can view published market days only
-- ============================================

CREATE POLICY "Published market days are publicly viewable" ON public.market_days
  FOR SELECT
  USING (is_published = TRUE);

-- ============================================
-- ADMIN INSERT POLICY
-- ============================================

CREATE POLICY "Admins can insert market days" ON public.market_days
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ADMIN UPDATE POLICY
-- ============================================

CREATE POLICY "Admins can update market days" ON public.market_days
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ADMIN DELETE POLICY
-- ============================================

CREATE POLICY "Admins can delete market days" ON public.market_days
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PART 4: VERIFICATION QUERIES
-- ============================================

-- Verify all policies exist
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Public (published only)'
    WHEN cmd = 'INSERT' THEN 'Admin only'
    WHEN cmd = 'UPDATE' THEN 'Admin only'
    WHEN cmd = 'DELETE' THEN 'Admin only'
    ELSE cmd::text
  END as access_level,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    ELSE 5
  END;

-- Verify RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled - SECURITY RISK!'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'market_days';

-- Count policies per operation type
SELECT 
  cmd as operation,
  COUNT(*) as policy_count,
  CASE 
    WHEN cmd = 'SELECT' AND COUNT(*) = 1 THEN '✅ Correct'
    WHEN cmd IN ('INSERT', 'UPDATE', 'DELETE') AND COUNT(*) = 1 THEN '✅ Correct'
    WHEN cmd = 'ALL' THEN '❌ Should not exist - use specific operations'
    ELSE '❌ Unexpected count'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
GROUP BY cmd
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    WHEN 'ALL' THEN 5
    ELSE 6
  END;

-- List all policies with details (to identify any remaining issues)
SELECT 
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    WHEN 'ALL' THEN 5
    ELSE 6
  END,
  policyname;

-- ============================================
-- PART 5: SECURITY CHECK SUMMARY
-- ============================================
--
-- Expected Results:
-- ✅ SELECT: 1 policy (public can view published only)
-- ✅ INSERT: 1 policy (admin only)
-- ✅ UPDATE: 1 policy (admin only)
-- ✅ DELETE: 1 policy (admin only)
-- ✅ RLS: Enabled
-- ✅ Vendors: No write policies (zero write access)
-- ✅ Service role: Full access (bypasses RLS automatically)
--
-- ============================================

