-- Reset Password for Admin Accounts
-- Note: This doesn't show passwords, but you can reset them via Supabase Auth

-- Option 1: Use Supabase Dashboard
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user by email
-- 3. Click "..." menu > "Reset Password"
-- 4. User will receive an email to reset password

-- Option 2: Use Supabase Auth API (if you have access)
-- You can't directly set passwords via SQL for security reasons
-- Passwords must be reset through Supabase Auth system

-- Option 3: Check if users exist (for verification)
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('sam@asia-insights.com', 'sam@kavsulting.com')
ORDER BY email;

-- If email_confirmed_at is NULL, the user needs to confirm their email first
-- If last_sign_in_at is NULL, they haven't signed in yet





