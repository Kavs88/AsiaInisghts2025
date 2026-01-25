# 📧 Resend Email Setup Guide

## ✅ Code is Ready!

The email functions are already implemented and ready to use. You just need to add your Resend API key.

## Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (free tier includes 3,000 emails/month)
3. Verify your email address

## Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Go to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "Sunday Market Production")
5. Copy the API key (starts with `re_`)

## Step 3: Set Supabase Secret

Run this command in PowerShell (replace with your actual API key):

```powershell
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

**Example:**
```powershell
supabase secrets set RESEND_API_KEY=re_abc123xyz789
```

## Step 4: Verify It's Set

Check that the secret is set:

```powershell
supabase secrets list
```

You should see `RESEND_API_KEY` in the list (the value will be hidden for security).

## Step 5: Update Email "From" Address (Optional)

The email functions use:
```
from: 'Sunday Market <notifications@sundaymarket.com>'
```

**For production**, you should:
1. Add your domain in Resend dashboard
2. Verify your domain (add DNS records)
3. Update the `from` address in:
   - `supabase/functions/send-vendor-email/index.ts` (line 174)
   - `supabase/functions/send-customer-email/index.ts` (similar line)

**For testing**, you can use Resend's test domain:
```
from: 'Sunday Market <onboarding@resend.dev>'
```

## Step 6: Test Email Notifications

1. Submit an order intent on your site
2. Check the vendor's email inbox
3. Check Resend dashboard → **Logs** to see if email was sent

## 📁 Files Using Resend

- ✅ `supabase/functions/send-vendor-email/index.ts` - Vendor notifications
- ✅ `supabase/functions/send-customer-email/index.ts` - Customer notifications

Both functions:
- Check for `RESEND_API_KEY` environment variable
- Fall back to logging if key is not set (for development)
- Include HTML and plain text email formats
- Handle errors gracefully

## 🎯 Current Status

- ✅ Email functions implemented
- ✅ Error handling in place
- ✅ Fallback logging for development
- ⏳ **Waiting for**: Resend API key to be set

Once you set the API key, emails will automatically start sending!

## 💡 Tips

- **Free tier**: 3,000 emails/month (perfect for testing)
- **Domain verification**: Required for production (not needed for testing)
- **Test emails**: Use `onboarding@resend.dev` for testing without domain verification
- **Monitoring**: Check Resend dashboard for delivery status and logs

---

**Next**: After setting the API key, test by submitting an order intent and checking if the vendor receives an email!





