# 🎉 Your Supabase Setup - Complete Instructions

## ✅ What You Have:

- **Supabase URL**: `https://hkssuvamxdnqptyprsom.supabase.co`
- **Anon Key**: `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`

## 📋 Step-by-Step Setup

### 1. Create `.env.local` File

Create a file named `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Your Service Role Key

1. **Open this link**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Scroll down to find **"service_role"** section
3. Click the 👁️ eye icon to reveal the key
4. Copy the entire key (it's long!)
5. Replace `your-service-role-key-here` in `.env.local`

⚠️ **Important**: Never share or commit this key - it's secret!

### 3. Set Up Database Tables

1. **Open SQL Editor**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
2. Click **"SQL Editor"** in the sidebar
3. Click **"New Query"**
4. Open `supabase/schema.sql` from your project
5. Copy **ALL** the contents (Ctrl/Cmd + A, then Ctrl/Cmd + C)
6. Paste into the SQL Editor (Ctrl/Cmd + V)
7. Click **"Run"** button (or press Ctrl/Cmd + Enter)
8. Wait for "Success" message ✅

**Then repeat for functions:**
1. Click **"New Query"** again
2. Open `supabase/functions.sql`
3. Copy all contents and paste
4. Click **"Run"**

### 4. Test Your Connection

1. Make sure `.env.local` is saved
2. Restart your dev server:
   ```bash
   npm run dev
   ```
3. Visit: http://localhost:3000/test-connection

This page will test your Supabase connection and tell you if everything is working!

### 5. Start Using the App

Once the test page shows ✅ success:
- Visit: http://localhost:3000
- You should see the Sunday Market homepage
- Everything is connected!

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom
- **API Settings**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
- **SQL Editor**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
- **Connection Test**: http://localhost:3000/test-connection

## ✅ Checklist

- [ ] Created `.env.local` file
- [ ] Added Supabase URL
- [ ] Added anon key
- [ ] Added service role key
- [ ] Ran `supabase/schema.sql` in SQL Editor
- [ ] Ran `supabase/functions.sql` in SQL Editor
- [ ] Restarted dev server
- [ ] Tested connection at `/test-connection`
- [ ] App is working! 🎉

## 🐛 Troubleshooting

### "Invalid API key"
- Make sure you copied the full service role key (no spaces)
- Check `.env.local` has no extra quotes or spaces

### "Relation does not exist"
- You need to run the SQL schema files
- Make sure you ran BOTH `schema.sql` AND `functions.sql`

### Connection test fails
- Check browser console for errors
- Verify `.env.local` file exists in project root
- Restart dev server after creating/changing `.env.local`

### Environment variables not showing
- Make sure file is named exactly `.env.local` (not `.env.local.txt`)
- Restart your dev server
- Check file is in project root (same folder as `package.json`)

## 📚 Next Steps

Once everything is connected:
1. The app will work with mock data
2. Connect pages to real Supabase queries (replace mock data)
3. Add authentication
4. Start adding real vendors and products!

---

**Need help?** Check:
- `QUICK_SETUP.md` - Quick setup guide
- `SETUP_SUPABASE.md` - Detailed Supabase setup
- `ENV_SETUP.md` - Environment variables guide


