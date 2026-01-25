-- Verify and Fix Admin Role
-- Run this in Supabase SQL Editor to check and fix admin role

-- Step 1: Check current admin users
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com')
ORDER BY email;

-- Step 2: If role is not 'admin', update it
UPDATE public.users
SET role = 'admin'
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com')
  AND (role IS NULL OR role != 'admin');

-- Step 3: If user records don't exist, create them
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';

-- Step 4: Verify the update worked
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com')
ORDER BY email;

-- Expected result: Both emails should show role = 'admin'





