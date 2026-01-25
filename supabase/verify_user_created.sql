-- Verify User Record Was Created
-- Run this to check if your user record exists

-- Step 1: Check all auth users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'name' as name
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: Check all public.users records
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- Step 3: Find auth users WITHOUT public.users records
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  'MISSING public.users record' as status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Step 4: If you see your email in Step 3, run this to create it:
-- (Replace 'your-email@example.com' with your actual email)
/*
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';
*/





