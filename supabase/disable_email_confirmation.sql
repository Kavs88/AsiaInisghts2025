-- Disable email confirmation requirement by automatically verifying the email upon insertion into auth.users

-- 1. Create a function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set the email_confirmed_at timestamp
  NEW.email_confirmed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach it to the auth.users table before insert
DROP TRIGGER IF EXISTS trigger_auto_confirm_email ON auth.users;

CREATE TRIGGER trigger_auto_confirm_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- 3. Retroactively confirm all existing unconfirmed users (optional, but good for cleanup)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;
