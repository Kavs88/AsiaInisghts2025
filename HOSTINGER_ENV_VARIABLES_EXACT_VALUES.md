# Hostinger Environment Variables - Exact Values

## Copy & Paste These Values

When adding environment variables in Hostinger, use these **exact values**:

---

## Required Environment Variables

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://hkssuvamxdnqptyprsom.supabase.co
```

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
```

### 3. NEXT_PUBLIC_APP_URL
```
https://saddlebrown-stinkbug-619379.hostingersite.com
```
*(Update this to your final domain when you get it)*

### 4. NODE_ENV
```
production
```

---

## Optional (But Recommended)

### 5. SUPABASE_SERVICE_ROLE_KEY
⚠️ **You need to get this from your Supabase dashboard**

**How to get it:**
1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Scroll down to find the **"service_role"** section
3. Click the **👁️ eye icon** to reveal the key
4. Click **📋 Copy** to copy the full key
5. Paste it as the value for `SUPABASE_SERVICE_ROLE_KEY`

**Note:** This key is secret and bypasses security. Never expose it publicly, but it's safe to add in Hostinger's environment variables (they're server-side only).

---

## How to Add in Hostinger

1. In Hostinger deployment settings, find **"Environment Variables"** section
2. Click **"Add"** button
3. For each variable above:
   - **Variable Name**: Enter the exact name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Variable Value**: Paste the exact value from above
   - Click **"Save"** or **"Add"**
4. Repeat for all variables

---

## Quick Copy-Paste Format

Here's everything in one block for easy reference:

```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://hkssuvamxdnqptyprsom.supabase.co

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk

Variable Name: NEXT_PUBLIC_APP_URL
Value: https://saddlebrown-stinkbug-619379.hostingersite.com

Variable Name: NODE_ENV
Value: production

Variable Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Get from Supabase dashboard - see instructions above]
```

---

## Verification Checklist

Before deploying, make sure you've added:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://hkssuvamxdnqptyprsom.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`
- [ ] `NEXT_PUBLIC_APP_URL` = `https://saddlebrown-stinkbug-619379.hostingersite.com`
- [ ] `NODE_ENV` = `production`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = [Your service role key from Supabase]

---

## Important Notes

1. **Case Sensitive**: Variable names are case-sensitive. Use exact capitalization shown above.

2. **No Spaces**: Make sure there are no leading/trailing spaces when copying values.

3. **Service Role Key**: If you don't have this yet, the app will still work for most features, but some admin/server-side functions may not work. It's recommended to add it.

4. **Update APP_URL**: When you get your final domain, update `NEXT_PUBLIC_APP_URL` to match it.

5. **After Adding Variables**: You may need to restart/redeploy your app for the variables to take effect.

---

## Need Help Getting Service Role Key?

1. **Direct Link**: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Look for a section labeled **"service_role"** (usually near the bottom)
3. It will be marked as **"secret"**
4. Click the eye icon 👁️ to reveal it
5. Copy the entire key (it's usually a long string starting with `eyJ...`)

---

**Ready to deploy?** Once all variables are added, proceed with your deployment!


