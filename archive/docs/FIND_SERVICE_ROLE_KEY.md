# How to Find Your Service Role Key (Secret Key)

## ✅ Yes, the Service Role Key = Secret Key

They're the same thing! In Supabase it's called "service_role" and marked as "secret".

## 📍 Where to Find It

1. **Go to this link:**
   https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api

2. **Scroll down to "Project API keys" section**

3. **You'll see two keys:**

   ```
   ┌──────────────────────────────────────────────────┐
   │ anon            public    [👁️ Reveal] [📋 Copy] │
   │ service_role    secret    [👁️ Reveal] [📋 Copy] │ ← You need this one!
   └──────────────────────────────────────────────────┘
   ```

4. **Click the 👁️ eye icon** next to "service_role" to reveal the key

5. **Click the 📋 copy button** to copy it

6. **Paste it** into your `.env.local` file, replacing:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```
   with:
   ```
   SUPABASE_SERVICE_ROLE_KEY=paste-the-actual-key-here
   ```

## 🔒 Important Security Notes

✅ **Safe to use in server-side code** (API routes, server actions)
❌ **NEVER expose to client-side** (browser JavaScript)
❌ **NEVER commit to git** (it's already in .gitignore)
❌ **NEVER share publicly**

## 💡 Quick Checklist

- [ ] Opened Supabase API settings page
- [ ] Found "service_role" key
- [ ] Clicked eye icon to reveal
- [ ] Copied the key
- [ ] Pasted into `.env.local`
- [ ] Saved the file

## 📝 Your .env.local Should Look Like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ← Long key here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The service role key is usually very long (starts with `eyJ...` if it's a JWT token).

## ✅ Once You've Added It

1. Save `.env.local`
2. Restart your dev server: `npm run dev`
3. Test connection: http://localhost:3000/test-connection

---

**Direct link to your API settings:**
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api


