# Supabase Redirect URLs Configuration

## ⚠️ Important: Configure Supabase Auth Redirect URLs

After deploying to Hostinger, you **must** update your Supabase project's redirect URLs to allow authentication to work.

## Your Hosting URL

**Temporary Hosting:** `https://plum-dogfish-418157.hostingersite.com`

## Steps to Configure

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **URL Configuration**

3. **Add Site URL**
   - **Site URL**: `https://plum-dogfish-418157.hostingersite.com`

4. **Add Redirect URLs**
   Add these redirect URLs (one per line):
   ```
   https://plum-dogfish-418157.hostingersite.com/auth/callback
   https://plum-dogfish-418157.hostingersite.com/auth/login
   https://plum-dogfish-418157.hostingersite.com/auth/signup
   https://plum-dogfish-418157.hostingersite.com/auth/reset-password
   https://plum-dogfish-418157.hostingersite.com/**
   ```

5. **Save Changes**

## Why This Is Needed

Supabase requires explicit redirect URLs for security. Without these configured:
- ❌ Login won't work
- ❌ Signup won't work
- ❌ Password reset won't work
- ❌ OAuth providers won't work

## After Configuration

Once you've added the redirect URLs:
1. Test login at: `https://plum-dogfish-418157.hostingersite.com/auth/login`
2. Test signup at: `https://plum-dogfish-418157.hostingersite.com/auth/signup`
3. Verify authentication flows work correctly

## When You Get Your Final Domain

When you configure your final custom domain, update these URLs in Supabase:
- Replace `plum-dogfish-418157.hostingersite.com` with your final domain
- Update both Site URL and Redirect URLs



