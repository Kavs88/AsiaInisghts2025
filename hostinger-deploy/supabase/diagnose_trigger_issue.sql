-- Diagnose Why Trigger Isn't Working
-- Run this to see what's happening

-- Step 1: Check if function exists and has SECURITY DEFINER
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

-- Step 2: Check trigger
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 3: Check if there are auth users without public.users records
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  pu.id as public_user_id,
  pu.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- Step 4: Test the function manually with the most recent auth user
DO $$
DECLARE
  test_user RECORD;
  result_count INT;
BEGIN
  -- Get most recent auth user without a public.users record
  SELECT * INTO test_user
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.users)
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF test_user.id IS NOT NULL THEN
    RAISE NOTICE 'Testing with user: % (ID: %)', test_user.email, test_user.id;
    
    -- Try to insert manually
    BEGIN
      INSERT INTO public.users (id, email, full_name, role)
      VALUES (
        test_user.id,
        test_user.email,
        COALESCE(
          test_user.raw_user_meta_data->>'name', 
          test_user.raw_user_meta_data->>'full_name', 
          'User'
        ),
        COALESCE(
          (test_user.raw_user_meta_data->>'role')::text, 
          'customer'
        )
      );
      
      RAISE NOTICE 'SUCCESS: User record created!';
    EXCEPTION WHEN others THEN
      RAISE WARNING 'ERROR: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'No auth users found without public.users records';
  END IF;
END $$;

-- Step 5: Check RLS policies on public.users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;





