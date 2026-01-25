-- Check Email Configuration and User Status
-- This helps diagnose why password reset emails aren't arriving

-- Step 1: Check user email confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  confirmed_at
FROM auth.users
WHERE email IN ('sam@asia-insights.com', 'sam@kavsulting.com')
ORDER BY email;

-- Step 2: Check if there are any email delivery issues
-- (This requires Supabase dashboard access to see logs)

-- Step 3: Check user metadata
SELECT 
  id,
  email,
  raw_user_meta_data,
  app_metadata
FROM auth.users
WHERE email IN ('sam@asia-insights.com', 'sam@kavsulting.com');





