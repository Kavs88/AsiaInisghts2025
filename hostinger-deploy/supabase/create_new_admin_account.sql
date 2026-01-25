-- Create New Admin Account (If Email Reset Isn't Working)
-- Use this if password reset emails aren't arriving
-- Replace with your preferred email (Gmail recommended for better delivery)

-- Step 1: You'll need to sign up with the new email first
-- Go to your app's signup page and create an account with: your-new-email@gmail.com

-- Step 2: After signing up, run this to make it admin:
-- (Replace 'your-new-email@gmail.com' with your actual new email)

INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'your-new-email@gmail.com'  -- REPLACE THIS
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';

-- Step 3: Verify
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'your-new-email@gmail.com';  -- REPLACE THIS





