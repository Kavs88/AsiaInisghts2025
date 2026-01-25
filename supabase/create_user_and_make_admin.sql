-- Create user record and make admin
-- This script handles the case where a user exists in auth.users but not in public.users
-- Replace 'your-email@example.com' with your actual email address

-- Step 1: Find your user ID from auth.users
-- Run this first to get your user ID:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 2: Insert or update user record in public.users
-- Replace 'USER_ID_FROM_STEP_1' with the UUID from step 1
-- Replace 'your-email@example.com' with your email

INSERT INTO public.users (id, email, role, full_name)
VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with UUID from step 1
  'your-email@example.com',  -- Replace with your email
  'admin',
  'Admin User'  -- Replace with your name
)
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email;

-- Step 3: Verify the update
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'your-email@example.com';

-- Alternative: One-step version (if you know your email)
-- This will work if your user exists in auth.users
INSERT INTO public.users (id, email, role, full_name)
SELECT 
  id,
  email,
  'admin'::text,
  COALESCE(raw_user_meta_data->>'name', 'Admin User')
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email;

-- Verify
SELECT u.id, u.email, u.full_name, u.role
FROM public.users u
WHERE u.email = 'your-email@example.com';





