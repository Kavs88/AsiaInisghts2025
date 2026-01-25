-- Manual User Creation for Existing Auth Users
-- Use this if you've signed up but the trigger didn't create your user record

-- Step 1: Find your auth user
SELECT id, email, created_at, raw_user_meta_data
FROM auth.users
WHERE email = 'your-email@example.com'
ORDER BY created_at DESC;

-- Step 2: Create user record manually (replace USER_ID and EMAIL with values from step 1)
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'User'),
  COALESCE((raw_user_meta_data->>'role')::text, 'customer')
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = COALESCE(EXCLUDED.role, public.users.role);

-- Step 3: Verify
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE email = 'your-email@example.com';

-- Step 4: If you want to be admin, run this:
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';





