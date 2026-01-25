-- ============================================
-- ADD YOURSELF AS SUPER USER
-- ============================================
-- This script finds your user account and adds you as a super user
-- ============================================

-- OPTION 1: Add by Email (EASIEST - just replace the email)
-- Replace 'your-email@example.com' with your actual email address
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.email = 'sam@kavsulting.com'  -- ⬅️ REPLACE THIS WITH YOUR EMAIL
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    notes = EXCLUDED.notes,
    updated_at = NOW()
RETURNING 
    uid,
    email,
    full_name,
    notes,
    created_at,
    '✅ Successfully added as super user!' as status;

-- ============================================
-- OPTION 2: Add by User ID
-- ============================================
-- If you know your user ID, uncomment and use this instead:
-- Replace 'YOUR_USER_ID_HERE' with your actual UUID

/*
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'YOUR_USER_ID_HERE'::UUID  -- ⬅️ REPLACE THIS WITH YOUR USER ID
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    notes = EXCLUDED.notes,
    updated_at = NOW()
RETURNING 
    uid,
    email,
    full_name,
    notes,
    created_at,
    '✅ Successfully added as super user!' as status;
*/

-- ============================================
-- VERIFY IT WORKED
-- ============================================
-- After running the INSERT above, run this to verify:

/*
SELECT 
    su.uid,
    su.email,
    su.full_name,
    su.notes,
    su.created_at,
    is_super_user(su.uid) as is_super_user_check,
    CASE 
        WHEN is_super_user(su.uid) THEN '✅ You are a super user!'
        ELSE '❌ Something went wrong'
    END as status
FROM public.super_users su
WHERE su.email = 'your-email@example.com';  -- ⬅️ REPLACE WITH YOUR EMAIL
*/


