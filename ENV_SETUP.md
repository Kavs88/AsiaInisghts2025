# Environment Variables Setup

## Quick Setup

You've provided your Supabase anon key. Here's what you need to do:

### 1. Create `.env.local` file

Create a file named `.env.local` in the root of your project with:

```env
# Your Supabase Project URL
# Get this from: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase Anon Key (you already have this)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk

# Service Role Key (NEVER share this!)
# Get from: Supabase Dashboard → Settings → API → service_role (secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Your Supabase Project URL

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
5. Paste it in `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`

### 3. Get Your Service Role Key

⚠️ **IMPORTANT**: This is a secret key that bypasses security. Never commit it or expose it!

1. In the same API settings page
2. Find **service_role** key (marked as "secret")
3. Copy it
4. Paste it in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

### 4. Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste and click **Run**
5. Then do the same for `supabase/functions.sql`

### 5. Test Connection

After setting up, restart your dev server:

```bash
npm run dev
```

The app should now connect to Supabase!

## What Each Variable Does

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL (safe to expose)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public API key (safe to expose, respects RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: Secret key for server-side operations (NEVER expose!)

## Security Notes

✅ **Safe in frontend** (NEXT_PUBLIC_*):
- These are exposed to the browser
- Protected by Row Level Security (RLS)

❌ **Server-only** (no NEXT_PUBLIC_):
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS
- Only use in API routes and server actions
- Never commit to git

## Troubleshooting

### "Invalid API key"
- Check you copied the full key (no spaces/line breaks)
- Verify you're using the anon key for frontend, service_role for backend

### "Failed to fetch"
- Verify your Supabase URL is correct
- Check your project is active in Supabase dashboard
- Check browser console for CORS errors

### Database errors
- Make sure you ran both SQL files (schema.sql and functions.sql)
- Check SQL Editor for any error messages
- Verify RLS policies were created

## Next Steps

Once your `.env.local` is set up:

1. ✅ Run `npm run dev`
2. ✅ Check browser console for connection errors
3. ✅ Try accessing a page (like `/vendors`)
4. ✅ If you see data or no errors, you're connected!

Need help? Check `SETUP_SUPABASE.md` for detailed instructions.






