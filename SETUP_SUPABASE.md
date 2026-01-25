# Supabase Setup Guide

## Step 1: Get Your Supabase Project URL

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find **Project URL** (looks like: `https://xxxxx.supabase.co`)
5. Copy it

## Step 2: Get Your Service Role Key

⚠️ **IMPORTANT**: This key bypasses RLS and should NEVER be exposed to the frontend!

1. In the same API settings page
2. Find **service_role** key (it's marked as "secret")
3. Copy it (keep it secure!)

## Step 3: Update .env.local

Edit `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Set Up Database

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Run it (this creates all tables, indexes, and RLS policies)
5. Then run `supabase/functions.sql` (this creates helper functions)

## Step 5: Test Connection

After setting up, run:

```bash
npm run dev
```

The app should connect to Supabase. Check the browser console for any connection errors.

## Troubleshooting

### "Invalid API key"
- Make sure you copied the full key (no spaces)
- Verify you're using the correct key type (anon vs service_role)

### "Failed to fetch"
- Check your Supabase URL is correct
- Make sure your project is active
- Check network tab in browser dev tools

### RLS Policy Errors
- Make sure you ran `supabase/schema.sql` completely
- Check that RLS is enabled on tables
- Verify your user has the correct role

## Security Reminders

✅ **Safe to expose** (frontend):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **NEVER expose** (server-only):
- `SUPABASE_SERVICE_ROLE_KEY`

Make sure `.env.local` is in `.gitignore` (it should be already)!






