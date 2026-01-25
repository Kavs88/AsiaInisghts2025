# Quick Setup - You're Almost Ready! 🚀

## ✅ You Have:

- ✅ Supabase Project URL: `https://hkssuvamxdnqptyprsom.supabase.co`
- ✅ Anon Key: `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`

## 🔧 Just Need One More Thing:

### Get Your Service Role Key

1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Scroll down to **service_role** section
3. Click the "eye" icon to reveal the key
4. Copy it

⚠️ **Important**: This key is secret and bypasses security - never share it publicly!

## 📝 Create `.env.local` File

Create a file named `.env.local` in your project root with this content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Replace `paste-your-service-role-key-here` with the service role key you copied.

## 🗄️ Set Up Database (Important!)

Before the app can work, you need to create the database tables:

1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
2. Click **SQL Editor** → **New Query**
3. Open `supabase/schema.sql` in your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Wait for "Success" message

Then do the same for `supabase/functions.sql`

## 🚀 Start Development

```bash
npm run dev
```

Visit http://localhost:3000 - you should see the Sunday Market homepage!

## ✅ Checklist

- [ ] Created `.env.local` file
- [ ] Added service role key to `.env.local`
- [ ] Ran `supabase/schema.sql` in SQL Editor
- [ ] Ran `supabase/functions.sql` in SQL Editor
- [ ] Started dev server with `npm run dev`
- [ ] Can access http://localhost:3000

## 🐛 Troubleshooting

**"Invalid API key"**
- Make sure you copied the full service role key (it's long!)
- Check for extra spaces in `.env.local`

**"Failed to fetch"**
- Verify your Supabase project is active
- Check that you ran the SQL schema files

**Database errors**
- Make sure you ran BOTH SQL files
- Check SQL Editor for error messages

## 📚 Next Steps

Once everything is working:
1. The app will show mock data initially
2. Connect pages to real Supabase queries (see `lib/supabase/queries.ts`)
3. Add authentication
4. Start adding real vendors/products!

Need help? Check the other documentation files or ask!


