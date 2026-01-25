-- Test Admin Check - This shows auth.uid() will be null in SQL Editor
-- This is EXPECTED - SQL Editor doesn't have a user session
-- The real test happens in the browser when isAdmin() runs

-- This query will show null because SQL Editor has no session
SELECT 
  auth.uid() as current_user_id,
  'SQL Editor has no user session - this is expected' as note;

-- To test if you're an admin, you need to:
-- 1. Be signed in to the web app
-- 2. Check browser console for [isAdmin] logs
-- 3. Go to /admin/debug page

-- Verify your admin role directly (bypasses session check):
SELECT 
  id,
  email,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ This user is an admin'
    ELSE '❌ This user is NOT an admin'
  END as status
FROM public.users
WHERE role = 'admin';

-- If you see your email in the list above, you ARE an admin
-- The issue is likely with the browser session, not the database





