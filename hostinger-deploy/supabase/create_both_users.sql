-- Create User Records for Both Accounts
-- This will create public.users records for both of your auth accounts

-- Create record for sam@asia-insights.com
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'sam@asia-insights.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';

-- Create record for sam@kavsulting.com
INSERT INTO public.users (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'sam@kavsulting.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
  role = 'admin';

-- Verify both records were created
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users
WHERE email IN ('sam@asia-insights.com', 'sam@kavsulting.com')
ORDER BY email;





