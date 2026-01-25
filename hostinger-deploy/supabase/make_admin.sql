-- Make a user an admin
-- Replace 'your-email@example.com' with your actual email address
-- Run this in Supabase SQL Editor

-- Option 1: Update by email
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Option 2: Update by user ID (if you know the UUID)
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE id = 'user-uuid-here';

-- Verify the update
SELECT id, email, full_name, role
FROM public.users
WHERE role = 'admin';





