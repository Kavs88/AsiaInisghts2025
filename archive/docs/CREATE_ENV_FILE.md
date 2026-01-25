# Create .env.local File

The `.env.local` file is protected for security reasons. Here's how to create it:

## Option 1: Copy the Template File (Easiest)

I've created a file called `env.local.template` with your credentials already filled in.

**Just rename it:**

### On Windows:
1. Right-click `env.local.template`
2. Select "Rename"
3. Change name to `.env.local` (the dot is important!)
4. Click Yes if Windows warns you about changing extension

### On Mac/Linux:
```bash
mv env.local.template .env.local
```

## Option 2: Create Manually

1. Create a new file in your project root (same folder as `package.json`)
2. Name it exactly: `.env.local`
3. Copy and paste this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Add Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Scroll to **"service_role"** section
3. Click the 👁️ eye icon to reveal
4. Copy the key
5. Replace `your-service-role-key-here` in `.env.local`

## Verify It's Created

After creating `.env.local`, you should see:
- File exists in your project root
- File name starts with a dot: `.env.local`
- Contains your Supabase credentials

## Test It

1. Save the file
2. Restart your dev server: `npm run dev`
3. Visit: http://localhost:3000/test-connection

The test page will verify your connection is working!

## Important Notes

- ✅ `.env.local` is automatically ignored by git (for security)
- ✅ Never commit this file to version control
- ✅ The service role key is secret - keep it safe!


