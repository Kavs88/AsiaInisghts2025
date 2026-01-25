-- RLS Policies for Vendor Sign Up
-- Allows authenticated users to create their own user and vendor records during signup

-- Policy: Users can insert their own user record
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can read their own record
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
CREATE POLICY "Users can read own record"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Vendors can insert their own vendor record
DROP POLICY IF EXISTS "Vendors can insert own record" ON public.vendors;
CREATE POLICY "Vendors can insert own record"
  ON public.vendors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: These policies allow authenticated users (who just signed up) to create their user and vendor records
-- The signup flow: auth.users → public.users → public.vendors

