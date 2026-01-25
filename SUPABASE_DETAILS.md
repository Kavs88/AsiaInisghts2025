# Supabase Project Details

**Last Updated:** 2025-01-29

---

## Project Information

### Project Reference ID
```
hkssuvamxdnqptyprsom
```

### Project URL
```
https://hkssuvamxdnqptyprsom.supabase.co
```

### Anon/Public Key
```
sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
```

### Service Role Key
⚠️ **Not stored in codebase** (as it should be)  
**Location:** Should be in `.env.local` file (not committed to git)  
**How to get it:**
1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api
2. Find "service_role" section
3. Click the eye icon to reveal the key
4. Copy and paste into `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

---

## Dashboard Links

### Main Dashboard
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom

### API Settings
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api

### SQL Editor
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor

### Database Tables
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor

### Edge Functions
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions

### Storage
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/storage/buckets

### Authentication
https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/auth/users

---

## Environment Variables

### Required Variables (from `env.local.template`)

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co

# Supabase Anon/Public Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk

# Service Role Key (NEVER commit or expose this!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Supabase CLI Commands

### Link Project
```bash
supabase link --project-ref hkssuvamxdnqptyprsom
```

### Check Status
```bash
supabase status
```

### Deploy Edge Functions
```bash
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud
```

### List Functions
```bash
supabase functions list
```

### Push Migrations
```bash
supabase db push
```

---

## Security Notes

✅ **Safe to expose (public):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

❌ **NEVER expose (secret):**
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses RLS, full database access

---

## Current Status

- ✅ Project URL configured
- ✅ Anon key configured
- ⚠️ Service Role Key - Check `.env.local` file (not in codebase for security)
- ✅ Project reference ID: `hkssuvamxdnqptyprsom`

---

## Quick Access

**For Phase 2 Deployment:**

1. **SQL Editor:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
2. **Functions:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions
3. **API Settings:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/settings/api

---

**Note:** The `.env.local` file exists in your project but is not committed to git (as it should be). The service role key should be stored there.






