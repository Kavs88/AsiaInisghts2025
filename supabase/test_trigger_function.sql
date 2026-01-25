-- Test the trigger function manually
-- This will help us see if the function works

-- First, check if there are any users in auth.users without corresponding records in public.users
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  pu.id as public_user_id,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- Test the trigger function manually (replace USER_ID with an actual auth user ID)
-- This simulates what the trigger should do
DO $$
DECLARE
  test_user_id UUID;
  test_email TEXT;
BEGIN
  -- Get the most recent auth user
  SELECT id, email INTO test_user_id, test_email
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Try to create user record manually using the function logic
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      test_user_id,
      test_email,
      'Test User',
      'customer'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email;
    
    RAISE NOTICE 'Created user record for: %', test_email;
  ELSE
    RAISE NOTICE 'No auth users found';
  END IF;
END $$;

-- Check if it was created
SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;





