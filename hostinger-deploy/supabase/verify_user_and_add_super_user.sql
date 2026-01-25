-- ============================================
-- VERIFY USER AND ADD AS SUPER USER
-- ============================================
-- 
-- This script helps you:
-- 1. Find your user ID from auth.users
-- 2. Check your admin status in public.users
-- 3. Add yourself as a super user
--
-- INSTRUCTIONS:
-- 1. Run this script to see your user information
-- 2. Copy your user ID from the results
-- 3. Uncomment and update the INSERT statement at the bottom
-- 4. Run the INSERT statement to add yourself as super user
--
-- ============================================
-- STEP 1: LIST ALL USERS (to find your UID)
-- ============================================

SELECT 
    id as user_id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- STEP 2: CHECK YOUR ROLE IN PUBLIC.USERS
-- ============================================
-- 
-- Replace 'YOUR_USER_ID_HERE' with your actual UID from Step 1
-- Uncomment and run:

/*
SELECT 
    u.id,
    u.email,
    u.role,
    u.full_name,
    CASE 
        WHEN u.role = 'admin' THEN '✅ You are an admin'
        ELSE '⚠️ You are NOT an admin (current role: ' || COALESCE(u.role, 'NULL') || ')'
    END as admin_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.super_users WHERE uid = u.id) 
        THEN '✅ You are a super user'
        ELSE '❌ You are NOT a super user'
    END as super_user_status
FROM public.users u
WHERE u.id = 'YOUR_USER_ID_HERE';
*/

-- ============================================
-- STEP 3: UPDATE YOUR ROLE TO ADMIN (if needed)
-- ============================================
-- 
-- If Step 2 shows you're not an admin, run this:
-- Replace 'YOUR_USER_ID_HERE' with your actual UID

/*
UPDATE public.users 
SET role = 'admin', updated_at = NOW()
WHERE id = 'YOUR_USER_ID_HERE'
RETURNING id, email, role, full_name;
*/

-- ============================================
-- STEP 4: ADD YOURSELF AS SUPER USER
-- ============================================
-- 
-- Replace 'YOUR_USER_ID_HERE' with your actual UID from Step 1
-- Uncomment and run:

/*
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access granted via setup_super_user_access.sql' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'YOUR_USER_ID_HERE'
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
RETURNING 
    id,
    uid,
    email,
    full_name,
    notes,
    created_at;
*/

-- ============================================
-- STEP 5: VERIFY SUPER USER STATUS
-- ============================================
-- 
-- After adding yourself, verify with this query:
-- Replace 'YOUR_USER_ID_HERE' with your actual UID

/*
SELECT 
    su.id,
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    -- Test the functions
    is_super_user(su.uid) as is_super_user_function_result,
    is_admin(su.uid) as is_admin_function_result,
    is_current_user_super_user() as is_current_user_super_user_result,
    -- Status summary
    CASE 
        WHEN is_super_user(su.uid) THEN '✅ Super user access confirmed'
        ELSE '❌ Super user function returned false'
    END as status
FROM public.super_users su
WHERE su.uid = 'YOUR_USER_ID_HERE';
*/

-- ============================================
-- STEP 6: TEST RLS POLICIES
-- ============================================
-- 
-- After adding yourself as super user, test these queries
-- (They should work even if you're not an admin)
-- Replace 'YOUR_USER_ID_HERE' with your actual UID

/*
-- Test 1: Can you view unpublished market days?
SELECT 
    id,
    market_date,
    location_name,
    is_published,
    CASE 
        WHEN is_published = FALSE THEN '✅ Can view unpublished (super user access working)'
        ELSE 'Published market day'
    END as test_result
FROM public.market_days
WHERE is_published = FALSE
LIMIT 5;

-- Test 2: Can you view inactive vendors?
SELECT 
    id,
    name,
    is_active,
    CASE 
        WHEN is_active = FALSE THEN '✅ Can view inactive vendor (super user access working)'
        ELSE 'Active vendor'
    END as test_result
FROM public.vendors
WHERE is_active = FALSE
LIMIT 5;

-- Test 3: List all super users
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.created_at,
    pu.role as user_role
FROM public.super_users su
LEFT JOIN public.users pu ON su.uid = pu.id
ORDER BY su.created_at DESC;
*/


