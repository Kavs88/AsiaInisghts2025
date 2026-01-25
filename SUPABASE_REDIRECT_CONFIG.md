# Supabase Redirect URL Configuration

## The Problem
When you click the password reset link from Supabase email, it redirects to your app. By default, Supabase redirects to the root URL (`/`) with the token in the hash.

## The Solution
You need to configure Supabase to redirect to `/auth/reset-password` instead.

## Step 1: Configure in Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Find **"Redirect URLs"** section
3. Add these URLs (one per line):
   ```
   http://localhost:3000/auth/reset-password
   https://yourdomain.com/auth/reset-password
   ```
4. Click **Save**

## Step 2: Verify Email Template (Optional)

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Find **"Reset Password"** template
3. Check that the redirect URL in the template matches your app URL
4. The link should look like: `{{ .ConfirmationURL }}`

## Step 3: Test

1. Request a new password reset email
2. Click the link in the email
3. It should now redirect to: `http://localhost:3000/auth/reset-password#access_token=...&type=recovery`
4. The reset password form should appear

## Alternative: Use Root Redirect Handler

If you can't change Supabase settings, the `AuthCallbackHandler` component should automatically redirect from `/` to `/auth/reset-password` when it detects a recovery token. Make sure this component is in your layout (it should be already).

## Troubleshooting

- **Link still goes to root (`/`)**: Check Supabase redirect URL settings
- **Page is blank**: Check browser console for errors
- **"Invalid link" error**: The token might have expired (request a new one)
- **Redirect not working**: Make sure `AuthCallbackHandler` is in `app/layout.tsx`





