-- Check admin role for current user
-- Run this in Supabase SQL Editor to verify the user's role

-- First, let's see all users and their roles
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.created_at,
  -- Check if this user exists in auth.users
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Exists in auth.users'
    ELSE '❌ NOT in auth.users'
  END as auth_status
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- Check specific emails (replace with your email)
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.created_at,
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email IN ('sam@asia-insights.com', 'sam@kavsulting.com')
ORDER BY u.email;

-- Check if there's a mismatch between auth.users and public.users
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  CASE 
    WHEN pu.id IS NOT NULL THEN '✅ Has public.users record'
    ELSE '❌ Missing public.users record'
  END as public_users_status,
  pu.role as public_role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email IN ('sam@asia-insights.com', 'sam@kavsulting.com')
ORDER BY au.email;





