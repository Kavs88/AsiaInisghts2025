# Deploy Edge Functions - Phase 2

**Status:** ✅ Database setup complete (3 properties, 3 events, 3 businesses)

---

## Option 1: Deploy via Supabase CLI (Recommended)

### Step 1: Login to Supabase CLI (if not already logged in)

```bash
supabase login
```

This will open your browser to authenticate.

### Step 2: Link Your Project

```bash
supabase link --project-ref hkssuvamxdnqptyprsom
```

**If you get a network error, try:**
- Check your internet connection
- Try again in a few moments
- Use Option 2 (Dashboard) instead

### Step 3: Deploy All Functions

```bash
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud
```

### Step 4: Verify Deployment

```bash
supabase functions list
```

**Expected Output:**
```
properties-crud
events-crud
businesses-crud
```

---

## Option 2: Deploy via Supabase Dashboard

If CLI is having issues, you can deploy via the dashboard:

### Step 1: Go to Functions Dashboard

**Link:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions

### Step 2: Deploy Each Function

For each function (`properties-crud`, `events-crud`, `businesses-crud`):

1. **If function doesn't exist yet:**
   - Click "Create a new function"
   - Name it (e.g., `properties-crud`)
   - Copy the code from `supabase/functions/properties-crud/index.ts`
   - Paste into the editor
   - Click "Deploy"

2. **If function already exists:**
   - Click on the function name
   - Click "Edit"
   - Update the code
   - Click "Deploy"

### Step 3: Verify in Dashboard

After deploying, you should see all three functions listed:
- `properties-crud`
- `events-crud`
- `businesses-crud`

---

## Option 3: Manual Function Code

If you need to copy the function code manually, here are the file locations:

- **Properties CRUD:** `supabase/functions/properties-crud/index.ts`
- **Events CRUD:** `supabase/functions/events-crud/index.ts`
- **Businesses CRUD:** `supabase/functions/businesses-crud/index.ts`

---

## Troubleshooting

### "Cannot find project ref"
- Run `supabase link --project-ref hkssuvamxdnqptyprsom` first
- Make sure you're logged in: `supabase login`

### Network Errors
- Check your internet connection
- Try again in a few moments
- Use Dashboard method (Option 2) instead

### "Function not found"
- Make sure the function files exist in `supabase/functions/`
- Check you're in the project root directory
- Verify the function name matches exactly

---

## After Deployment

Once all functions are deployed:

1. ✅ **Verify in Dashboard:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions
2. ✅ **Test Admin Dashboard:** http://localhost:3001/markets/admin
3. ✅ **Run E2E Tests:** `npm run test:e2e`

---

## Quick Commands Summary

```bash
# Login (if needed)
supabase login

# Link project
supabase link --project-ref hkssuvamxdnqptyprsom

# Deploy functions
supabase functions deploy properties-crud
supabase functions deploy events-crud
supabase functions deploy businesses-crud

# Verify
supabase functions list
```

---

**Next:** After deploying functions, test the admin dashboard and run E2E tests!






