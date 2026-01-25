-- ============================================
-- VERIFY SUPER USER ACCESS
-- ============================================
-- Run this to verify your super user access is working
-- ============================================

-- Check super user status
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    is_super_user(su.uid) as is_super_user_check,
    is_admin(su.uid) as is_admin_check,
    CASE 
        WHEN is_super_user(su.uid) THEN '✅ You are a super user!'
        ELSE '❌ Something went wrong'
    END as status
FROM public.super_users su
WHERE su.email = 'sam@kavsulting.com';

-- Test 1: Can you view unpublished market days?
-- This should return rows even if is_published = FALSE
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

-- Test 2: Can you view inactive vendors?
-- This should return rows even if is_active = FALSE
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

-- Test 3: List all super users
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    pu.role as user_role
FROM public.super_users su
LEFT JOIN public.users pu ON su.uid = pu.id
ORDER BY su.created_at DESC;


