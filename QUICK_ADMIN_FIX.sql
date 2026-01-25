-- QUICK FIX: Set Admin Role for Your Accounts
-- Run this in Supabase SQL Editor

-- Set admin role for both your accounts
UPDATE public.users
SET role = 'admin'
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com');

-- Verify the update
SELECT id, email, full_name, role
FROM public.users
WHERE email IN ('sam@kavsulting.com', 'sam@asia-insights.com');





