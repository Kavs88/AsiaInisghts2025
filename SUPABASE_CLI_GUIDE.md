# Supabase CLI Setup & Usage Guide

Complete guide for installing and using Supabase CLI to deploy Edge Functions and manage your project.

---

## Step 1: Install Supabase CLI

### Option A: Using npm (Recommended)

```bash
npm install -g supabase
```

### Option B: Using Homebrew (Mac/Linux)

```bash
brew install supabase/tap/supabase
```

### Option C: Using Scoop (Windows)

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Option D: Download Binary

Visit: https://github.com/supabase/cli/releases
- Download the binary for your OS
- Add to your PATH

---

## Step 2: Verify Installation

```bash
supabase --version
```

You should see something like: `supabase 1.x.x`

---

## Step 3: Login to Supabase

```bash
supabase login
```

This will:
1. Open your browser
2. Ask you to sign in to Supabase
3. Authorize the CLI
4. Save your access token

**Note**: If you're already logged in, you can skip this step.

---

## Step 4: Link Your Project

You need to link your local project to your Supabase project.

### Find Your Project Reference ID

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

### Link the Project

```bash
cd "C:\Users\admin\Sunday Market Project"
supabase link --project-ref your-project-ref-id
```

Replace `your-project-ref-id` with your actual project reference ID.

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

---

## Step 5: Deploy Edge Function

Now you can deploy the customer email notification function:

```bash
supabase functions deploy send-customer-email
```

This will:
- Upload the function code
- Deploy it to your Supabase project
- Make it available at: `https://your-project.supabase.co/functions/v1/send-customer-email`

---

## Step 6: Set Environment Variables (Secrets)

Set the Resend API key as a secret:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

**Important**: Replace `your_resend_api_key_here` with your actual Resend API key.

**Example:**
```bash
supabase secrets set RESEND_API_KEY=re_1234567890abcdef
```

---

## Common Commands

### Check Project Status
```bash
supabase status
```

### List All Functions
```bash
supabase functions list
```

### View Function Logs
```bash
supabase functions logs send-customer-email
```

### Update a Function
```bash
supabase functions deploy send-customer-email
```

### Remove a Secret
```bash
supabase secrets unset RESEND_API_KEY
```

### List All Secrets
```bash
supabase secrets list
```

---

## Troubleshooting

### "Command not found" or "supabase: command not found"

**Solution**: The CLI isn't in your PATH. Try:
- Restart your terminal/PowerShell
- Reinstall using npm: `npm install -g supabase`
- Check installation: `npm list -g supabase`

### "Not logged in" Error

**Solution**: Run `supabase login` again

### "Project not linked" Error

**Solution**: Run `supabase link --project-ref your-project-ref`

### "Function not found" Error

**Solution**: Make sure you're in the project root directory:
```bash
cd "C:\Users\admin\Sunday Market Project"
```

### Can't Find Project Reference ID

**Solution**:
1. Go to Supabase Dashboard
2. Click on your project
3. Settings → General
4. Look for "Reference ID" or "Project ID"

---

## Alternative: Using Supabase Dashboard (No CLI)

If you prefer not to use CLI, you can do everything via the web dashboard:

### Deploy Function via Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** in the sidebar
4. Click **Create Function**
5. Name: `send-customer-email`
6. Copy code from `supabase/functions/send-customer-email/index.ts`
7. Paste into the editor
8. Click **Deploy**

### Set Secrets via Dashboard

1. Go to **Edge Functions** → **send-customer-email**
2. Click **Settings** or **Environment Variables**
3. Click **Add Secret**
4. Name: `RESEND_API_KEY`
5. Value: Your Resend API key
6. Click **Save**

---

## Quick Start Checklist

- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Verify: `supabase --version`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref your-ref-id`
- [ ] Deploy function: `supabase functions deploy send-customer-email`
- [ ] Set secret: `supabase secrets set RESEND_API_KEY=your_key`

---

## Need Help?

- **Supabase CLI Docs**: https://supabase.com/docs/reference/cli
- **Edge Functions Docs**: https://supabase.com/docs/guides/functions
- **Community**: https://github.com/supabase/supabase/discussions

---

## Example: Complete Workflow

```bash
# 1. Install (if not already installed)
npm install -g supabase

# 2. Verify
supabase --version

# 3. Login (opens browser)
supabase login

# 4. Navigate to project
cd "C:\Users\admin\Sunday Market Project"

# 5. Link project (replace with your project ref)
supabase link --project-ref abcdefghijklmnop

# 6. Deploy function
supabase functions deploy send-customer-email

# 7. Set API key (replace with your actual key)
supabase secrets set RESEND_API_KEY=re_1234567890abcdef

# 8. Verify deployment
supabase functions list

# 9. Check logs (optional)
supabase functions logs send-customer-email
```

That's it! Your Edge Function is now deployed and ready to send customer notifications.





