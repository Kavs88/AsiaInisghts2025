-- ============================================
-- TEST SUPER USER ACCESS
-- ============================================
-- 
-- This script tests super user access to verify everything is working.
-- Run this AFTER:
-- 1. Running setup_super_user_access.sql
-- 2. Adding yourself to the super_users table
--
-- Replace 'YOUR_USER_ID_HERE' with your actual UID throughout this script.
--
-- ============================================
-- STEP 1: VERIFY SUPER USER STATUS
-- ============================================

-- Replace 'YOUR_USER_ID_HERE' with your actual UID
/*
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    -- Test the functions
    is_super_user(su.uid) as is_super_user_result,
    is_admin(su.uid) as is_admin_result,
    is_current_user_super_user() as is_current_user_super_user_result,
    -- Status summary
    CASE 
        WHEN is_super_user(su.uid) THEN '✅ Super user function working'
        ELSE '❌ Super user function returned false'
    END as super_user_status,
    CASE 
        WHEN is_admin(su.uid) THEN '✅ Also an admin'
        ELSE 'ℹ️ Not an admin (but super user access should still work)'
    END as admin_status
FROM public.super_users su
WHERE su.uid = 'YOUR_USER_ID_HERE';
*/

-- ============================================
-- STEP 2: TEST MARKET_DAYS ACCESS
-- ============================================

-- Test 1: Can you view unpublished market days?
-- This should return rows even if is_published = FALSE
/*
SELECT 
    id,
    market_date,
    location_name,
    is_published,
    created_at,
    CASE 
        WHEN is_published = FALSE THEN '✅ Can view unpublished (super user access working!)'
        ELSE 'Published market day'
    END as test_result
FROM public.market_days
WHERE is_published = FALSE
ORDER BY market_date DESC
LIMIT 5;
*/

-- Test 2: Try to INSERT a test market day (then delete it)
-- Uncomment to test INSERT access
/*
-- First, create a test market day
INSERT INTO public.market_days (
    market_date,
    location_name,
    location_address,
    is_published,
    start_time,
    end_time
)
VALUES (
    CURRENT_DATE + INTERVAL '30 days',
    'Test Market Day - DELETE ME',
    'Test Address',
    FALSE,  -- Unpublished
    '09:00:00',
    '15:00:00'
)
RETURNING id, market_date, location_name, is_published;

-- Save the ID from above, then delete it:
-- DELETE FROM public.market_days WHERE id = 'THE_ID_FROM_ABOVE';
*/

-- Test 3: Try to UPDATE an unpublished market day
-- Replace 'MARKET_DAY_ID_HERE' with an actual unpublished market day ID
/*
UPDATE public.market_days
SET location_name = location_name || ' (Updated by Super User)'
WHERE id = 'MARKET_DAY_ID_HERE' AND is_published = FALSE
RETURNING id, location_name, is_published;
*/

-- ============================================
-- STEP 3: TEST VENDORS ACCESS
-- ============================================

-- Test 1: Can you view inactive vendors?
-- This should return rows even if is_active = FALSE
/*
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at,
    CASE 
        WHEN is_active = FALSE THEN '✅ Can view inactive vendor (super user access working!)'
        ELSE 'Active vendor'
    END as test_result
FROM public.vendors
WHERE is_active = FALSE
ORDER BY created_at DESC
LIMIT 5;
*/

-- Test 2: Try to UPDATE any vendor
-- Replace 'VENDOR_ID_HERE' with an actual vendor ID
/*
UPDATE public.vendors
SET tagline = COALESCE(tagline, '') || ' (Updated by Super User)'
WHERE id = 'VENDOR_ID_HERE'
RETURNING id, name, tagline;
*/

-- Test 3: Try to INSERT a test vendor (then delete it)
-- Uncomment to test INSERT access
/*
-- First, create a test vendor
INSERT INTO public.vendors (
    name,
    slug,
    tagline,
    is_active,
    is_verified,
    delivery_available,
    pickup_available
)
VALUES (
    'Test Vendor - DELETE ME',
    'test-vendor-delete-me-' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'This is a test vendor created by super user',
    FALSE,  -- Inactive
    FALSE,
    FALSE,
    FALSE
)
RETURNING id, name, slug, is_active;

-- Save the ID from above, then delete it:
-- DELETE FROM public.vendors WHERE id = 'THE_ID_FROM_ABOVE';
*/

-- ============================================
-- STEP 4: VERIFY RLS POLICIES
-- ============================================

-- Check all policies on market_days
/*
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%Super user%' THEN '✅ Super user policy'
        WHEN policyname LIKE '%Admin%' THEN 'Admin policy'
        ELSE 'Other policy'
    END as policy_type
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
    END,
    policyname;
*/

-- Check all policies on vendors
/*
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN policyname LIKE '%Super user%' THEN '✅ Super user policy'
        WHEN policyname LIKE '%Admin%' THEN 'Admin policy'
        ELSE 'Other policy'
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'vendors'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
        ELSE 5
    END,
    policyname;
*/

-- ============================================
-- STEP 5: SUMMARY CHECKLIST
-- ============================================
--
-- ✅ Super user added to super_users table
-- ✅ is_super_user() function returns true for your UID
-- ✅ Can view unpublished market days
-- ✅ Can view inactive vendors
-- ✅ Can INSERT/UPDATE/DELETE market days
-- ✅ Can INSERT/UPDATE/DELETE vendors
-- ✅ RLS policies are in place
--
-- If all tests pass, super user access is working correctly!
--
-- ============================================


