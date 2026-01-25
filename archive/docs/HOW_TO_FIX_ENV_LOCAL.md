# How to Fix .env.local File

If your `.env.local` file appears empty, here's how to fix it:

## Option 1: Copy from Template (Easiest)

I've created a file called `COPY_TO_ENV_LOCAL.txt` with the exact content. 

1. Open `COPY_TO_ENV_LOCAL.txt`
2. Copy all 4 lines (the ones starting with `NEXT_PUBLIC_...`)
3. Open `.env.local` 
4. Paste the content
5. Save

## Option 2: Manual Entry

Create or edit `.env.local` in your project root and add these 4 lines:

```
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verify the File

After saving, your `.env.local` should contain exactly:
- Line 1: `NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co`
- Line 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`
- Line 3: `SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`
- Line 4: `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Important Notes

- Make sure the file is named `.env.local` (starts with a dot)
- No quotes around the values
- Each variable on its own line
- No blank lines between variables (optional but cleaner)

## Next Step

After the file is correct, you need to:
1. Replace `your-service-role-key-here` with your actual service role key
2. Save the file
3. Run the database setup SQL files

## Still Can't See It?

The file might be hidden. In Windows File Explorer:
1. Click "View" tab
2. Check "Hidden items" checkbox
3. Now you should see `.env.local`

Or open it directly:
- In VS Code: File → Open File → `.env.local`
- In Notepad: File → Open → Type `.env.local` in the filename field


