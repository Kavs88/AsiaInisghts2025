-- Complete Trigger Fix - Recreate everything from scratch
-- Run this if the trigger isn't working

-- Step 1: Drop and recreate function with explicit permissions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert into public.users, bypassing RLS because we're using SECURITY DEFINER
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      'User'
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::text, 
      'customer'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name);
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 2: Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Step 3: Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify function exists and has SECURITY DEFINER
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

-- Step 5: Verify trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Step 6: Test with a manual call (if you have an auth user)
-- Uncomment and replace USER_ID with an actual auth user ID to test
/*
DO $$
DECLARE
  test_user RECORD;
BEGIN
  SELECT * INTO test_user
  FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF test_user.id IS NOT NULL THEN
    PERFORM public.handle_new_user() FROM (SELECT test_user.*) AS t;
    RAISE NOTICE 'Trigger function executed for user: %', test_user.email;
  END IF;
END $$;
*/





