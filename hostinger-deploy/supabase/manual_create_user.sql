-- Manual User Creation Script
-- Use this if signup fails and you need to manually create a user record
-- Replace the values with your actual information

-- Step 1: Find your user ID from auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- Step 2: Insert user record (replace USER_ID with the UUID from step 1)
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'USER_ID_FROM_STEP_1',  -- Replace with UUID from step 1
  'your-email@example.com',  -- Replace with your email
  'Your Name',  -- Replace with your name
  'admin'  -- or 'vendor' or 'customer'
)
ON CONFLICT (id) 
DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Step 3: Verify
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE email = 'your-email@example.com';





