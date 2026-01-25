# Password Reset Email Not Arriving - Troubleshooting Guide

## Common Issues

### 1. Check Spam/Junk Folder
- Password reset emails often go to spam
- Check your spam folder for emails from Supabase
- Add `noreply@mail.app.supabase.io` to your contacts/whitelist

### 2. Email Provider Blocking
- Some email providers block automated emails
- Try a different email address (Gmail usually works best)
- Check if your email provider has security filters blocking Supabase

### 3. Supabase Email Settings
- Supabase uses a default email service (limited)
- For production, you should configure custom SMTP
- Default emails might have delivery issues

## Solutions

### Solution 1: Use Supabase Dashboard to Manually Reset

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your user by email
3. Click the **"..."** menu → **"Send password reset email"**
4. Wait a few minutes and check spam folder
5. If still not received, try Solution 2

### Solution 2: Configure Custom SMTP (Recommended for Production)

1. Go to **Supabase Dashboard** → **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Configure with your email provider:
   - **Gmail**: Use App Password
   - **SendGrid**: Use API key
   - **Mailgun**: Use API credentials
   - **Custom SMTP**: Use your provider's SMTP settings

### Solution 3: Use Supabase Admin API (Advanced)

If you have access to the Supabase admin API, you can programmatically reset passwords, but this requires API access.

### Solution 4: Create New Account (Temporary Workaround)

If emails aren't working, you can:
1. Create a new account with a different email (Gmail recommended)
2. Run the admin setup SQL to make it admin
3. Use that account instead

## Quick Check

Run this SQL to see user status:
```sql
SELECT 
  email,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email IN ('sam@asia-insights.com', 'sam@kavsulting.com');
```

If `email_confirmed_at` is NULL, the email wasn't confirmed, which might affect password reset.

## Next Steps

1. ✅ Check spam folder
2. ✅ Wait 5-10 minutes (email delivery can be delayed)
3. ✅ Try resetting again
4. ✅ If still not working, configure custom SMTP in Supabase
5. ✅ As last resort, create a new account with Gmail





