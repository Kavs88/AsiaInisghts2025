-- Fix Trigger with Better Error Handling and Logging
-- This version logs errors so we can see what's failing

-- Step 1: Drop and recreate function with error logging
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Extract user data
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'full_name', 
    'User'
  );
  
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::text, 
    'customer'
  );
  
  -- Log attempt
  RAISE NOTICE 'handle_new_user: Creating user record for % (ID: %)', NEW.email, NEW.id;
  
  -- Insert into public.users, bypassing RLS because we're using SECURITY DEFINER
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = COALESCE(EXCLUDED.role, public.users.role);
  
  RAISE NOTICE 'handle_new_user: SUCCESS - User record created for %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'handle_new_user: ERROR creating user record for %: % (SQLSTATE: %)', 
      NEW.email, SQLERRM, SQLSTATE;
    -- Still return NEW so auth user creation succeeds
    RETURN NEW;
END;
$$;

-- Step 2: Grant execute permission to all necessary roles
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- Step 3: Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify
SELECT 
  p.proname as function_name,
  p.prosecdef as is_security_definer,
  CASE WHEN p.prosecdef THEN 'YES' ELSE 'NO' END as security_definer_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'handle_new_user';

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';





