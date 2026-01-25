-- Configure Password Reset Redirect URL in Supabase
-- This is a reminder - you need to do this in the Supabase Dashboard, not via SQL

-- Go to: Supabase Dashboard → Authentication → URL Configuration
-- Add these to "Redirect URLs":
--   http://localhost:3000/auth/reset-password
--   https://yourdomain.com/auth/reset-password (for production)

-- This allows Supabase to redirect password reset links to your app





