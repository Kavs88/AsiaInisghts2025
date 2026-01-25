-- QUICK FIX - Run this NOW
-- Replace 'your-email@example.com' with your actual email address

-- Step 1: Create your user record from your auth user
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'  -- Set as admin directly
FROM auth.users
WHERE email = 'your-email@example.com'  -- REPLACE THIS WITH YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';  -- Make sure you're admin

-- Step 2: Verify it worked
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE email = 'your-email@example.com';  -- REPLACE THIS WITH YOUR EMAIL

-- If you see your record with role = 'admin', you're done!
-- Sign out and sign back in, then go to /admin





