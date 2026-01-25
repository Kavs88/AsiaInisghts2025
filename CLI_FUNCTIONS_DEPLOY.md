# Deploy Edge Functions via CLI (Using Dashboard Instructions)

The Supabase Dashboard is showing you CLI commands. Here's how to adapt them for our 3 functions:

---

## Step 1: Deploy Each Function

Since the functions already exist in your project, you can deploy them directly using the `--project-ref` flag:

### Deploy Properties CRUD Function

```bash
supabase functions deploy properties-crud --project-ref hkssuvamxdnqptyprsom
```

### Deploy Events CRUD Function

```bash
supabase functions deploy events-crud --project-ref hkssuvamxdnqptyprsom
```

### Deploy Businesses CRUD Function

```bash
supabase functions deploy businesses-crud --project-ref hkssuvamxdnqptyprsom
```

---

## Step 2: Verify Deployment

After deploying, you can verify they're deployed by checking the dashboard:
- Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions

You should see all 3 functions listed.

---

## Alternative: If You Need to Create Functions First

If the functions don't exist yet in Supabase (even though the code files exist locally), you might need to create them first. However, since the code files already exist in `supabase/functions/`, you should be able to deploy directly.

---

## Troubleshooting

### "Function not found locally"
- Make sure you're in the project root: `C:\Users\admin\Sunday Market Project`
- Verify the files exist:
  - `supabase/functions/properties-crud/index.ts`
  - `supabase/functions/events-crud/index.ts`
  - `supabase/functions/businesses-crud/index.ts`

### "Authentication required"
- You might need to login first: `supabase login`
- Or use the `--project-ref` flag (which you're already doing)

### "Network error"
- Try again in a few moments
- Check your internet connection
- The `--project-ref` flag should work even without linking

---

## Quick Copy-Paste Commands

Run these in your PowerShell terminal (one at a time):

```powershell
cd "C:\Users\admin\Sunday Market Project"

supabase functions deploy properties-crud --project-ref hkssuvamxdnqptyprsom

supabase functions deploy events-crud --project-ref hkssuvamxdnqptyprsom

supabase functions deploy businesses-crud --project-ref hkssuvamxdnqptyprsom
```

---

**Note:** The `--project-ref` flag allows you to deploy without linking the project first, which should avoid the network issues you were having earlier.






