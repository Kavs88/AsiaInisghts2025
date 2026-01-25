# Stage 8 Deployment Guide

**No SQL Required** - These are deployment steps for Edge Functions and environment variables.

---

## Step 1: Deploy Edge Function

The Edge Function needs to be deployed to Supabase. You have two options:

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project** (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in Supabase Dashboard → Settings → General)

4. **Deploy the function**:
   ```bash
   supabase functions deploy send-customer-email
   ```

### Option B: Using Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** in the sidebar
3. Click **Create Function**
4. Name it: `send-customer-email`
5. Copy the contents of `supabase/functions/send-customer-email/index.ts`
6. Paste into the editor
7. Click **Deploy**

---

## Step 2: Set Resend API Key

You need to set the `RESEND_API_KEY` environment variable for the Edge Function.

### Option A: Using Supabase CLI

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Option B: Using Supabase Dashboard

1. Go to **Edge Functions** → **send-customer-email**
2. Click **Settings** or **Environment Variables**
3. Add new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
4. Click **Save**

### Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys** in your dashboard
3. Create a new API key
4. Copy the key (starts with `re_`)

---

## Step 3: Update Email Domain (Optional but Recommended)

Update the "from" email address in the Edge Function to use your verified domain.

1. **Verify your domain in Resend**:
   - Go to Resend Dashboard → **Domains**
   - Add your domain (e.g., `aimarkets.com`)
   - Follow DNS verification steps

2. **Update the Edge Function**:
   - Open `supabase/functions/send-customer-email/index.ts`
   - Find line 174 (or search for `from:`)
   - Change:
     ```typescript
     from: 'AI Markets <notifications@aimarkets.com>',
     ```
   - Replace `aimarkets.com` with your verified domain
   - Redeploy the function (repeat Step 1)

---

## Step 4: Test the Notifications

1. **Submit an order intent** from a product page
2. **As a vendor**, log in and confirm/decline the order
3. **Check the customer's email** for the notification
4. **Check Supabase logs** if email doesn't arrive:
   - Go to **Edge Functions** → **send-customer-email** → **Logs**

---

## Troubleshooting

### Email Not Sending

1. **Check Resend API Key**:
   - Verify it's set correctly in Supabase
   - Check Resend dashboard for API usage/errors

2. **Check Edge Function Logs**:
   - Supabase Dashboard → Edge Functions → send-customer-email → Logs
   - Look for error messages

3. **Test with Logging**:
   - If `RESEND_API_KEY` is not set, the function will log instead of sending
   - Check Supabase logs to see the email content

### Function Not Found

- Make sure you deployed the function correctly
- Check the function name matches exactly: `send-customer-email`
- Verify the function appears in Supabase Dashboard → Edge Functions

---

## Quick Reference

**No SQL Commands Needed** ✅

**Commands Needed:**
```bash
# Deploy function
supabase functions deploy send-customer-email

# Set API key
supabase secrets set RESEND_API_KEY=your_key_here
```

**Or use Supabase Dashboard:**
- Deploy function via UI
- Set environment variable via UI

---

## Summary

✅ **No SQL required**  
✅ **Deploy Edge Function** (CLI or Dashboard)  
✅ **Set RESEND_API_KEY** (CLI or Dashboard)  
✅ **Update email domain** (optional, in code)  
✅ **Test notifications**

That's it! No database migrations or SQL scripts needed for Stage 8.

