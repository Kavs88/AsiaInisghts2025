# 🗄️ Database Setup - Let's Do This!

Now that your `.env.local` is configured, let's set up your database tables.

## Step 1: Open SQL Editor

Click this link to open your Supabase SQL Editor:
**https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor**

## Step 2: Run Schema SQL (Creates Tables)

1. In the SQL Editor, click **"New Query"** button
2. Open the file `supabase/schema.sql` from your project folder
3. Select ALL the content (Ctrl+A)
4. Copy it (Ctrl+C)
5. Paste it into the SQL Editor (Ctrl+V)
6. Click the **"Run"** button (or press Ctrl+Enter)
7. Wait for the success message ✅

This creates all your tables, indexes, and security policies.

## Step 3: Run Functions SQL (Helper Functions)

1. Click **"New Query"** again (or clear the editor)
2. Open the file `supabase/functions.sql` from your project folder
3. Select ALL the content (Ctrl+A)
4. Copy it (Ctrl+C)
5. Paste it into the SQL Editor (Ctrl+V)
6. Click **"Run"** button (or press Ctrl+Enter)
7. Wait for the success message ✅

This creates helper functions for searches, stock management, etc.

## Step 4: Verify It Worked

After running both SQL files, you should see:
- ✅ "Success. No rows returned" or similar
- ✅ No error messages
- ✅ Tables created in the left sidebar

## Step 5: Test Your Connection

Once the database is set up:

```bash
npm run dev
```

Then visit: **http://localhost:3000/test-connection**

You should see: ✅ Connection successful!

## 🐛 Troubleshooting

### "Relation already exists"
- That's okay! It means tables already exist
- You can ignore this or drop tables first if you want a fresh start

### "Permission denied"
- Make sure you're logged into Supabase
- Check you're in the right project

### Other errors
- Check the error message carefully
- Make sure you copied the ENTIRE SQL file content
- Try running it again

## ✅ Checklist

- [ ] Opened SQL Editor
- [ ] Ran `supabase/schema.sql` ✅
- [ ] Ran `supabase/functions.sql` ✅
- [ ] No errors shown
- [ ] Started dev server (`npm run dev`)
- [ ] Tested connection at `/test-connection`
- [ ] ✅ Everything working!

## 🎉 Next Steps

Once the database is set up and connection test passes:
1. Visit http://localhost:3000 to see your app!
2. Start adding vendors and products
3. Build out features

---

**Quick Link to SQL Editor:**
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor


