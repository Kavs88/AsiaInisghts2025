# Deploy Edge Functions via Supabase Dashboard

## Direct Link to Functions Dashboard

**Go here:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions

---

## Step-by-Step Instructions

### Step 1: Open Functions Dashboard

1. Go to: https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions
2. You'll see a list of existing functions (if any) or an empty state

### Step 2: Create/Deploy Each Function

You need to deploy **3 functions**:

1. **properties-crud**
2. **events-crud**
3. **businesses-crud**

---

## For Each Function:

### Option A: If Function Doesn't Exist Yet

1. Click **"Create a new function"** button (or "New Function")
2. **Function Name:** Enter exactly: `properties-crud` (or `events-crud`, `businesses-crud`)
3. **Copy the code** from these files in your project:
   - `supabase/functions/properties-crud/index.ts` → Copy ALL code
   - `supabase/functions/events-crud/index.ts` → Copy ALL code
   - `supabase/functions/businesses-crud/index.ts` → Copy ALL code
4. **Paste** into the code editor in the dashboard
5. Click **"Deploy"** or **"Save"** button
6. Wait for deployment to complete (you'll see a success message)

### Option B: If Function Already Exists

1. Click on the function name in the list
2. Click **"Edit"** button
3. Replace the code with the code from your local file
4. Click **"Deploy"** or **"Save"**

---

## Function Code Locations

The code you need to copy is in these files:

1. **Properties CRUD:**
   - File: `supabase/functions/properties-crud/index.ts`
   - Open this file, select all (Ctrl+A), copy (Ctrl+C)

2. **Events CRUD:**
   - File: `supabase/functions/events-crud/index.ts`
   - Open this file, select all (Ctrl+A), copy (Ctrl+C)

3. **Businesses CRUD:**
   - File: `supabase/functions/businesses-crud/index.ts`
   - Open this file, select all (Ctrl+A), copy (Ctrl+C)

---

## Visual Guide

```
Supabase Dashboard
└── Functions (left sidebar)
    └── [Click here]
        └── "Create a new function" button
            └── Enter function name
            └── Paste code from your local file
            └── Click "Deploy"
```

---

## After Deployment

1. ✅ You should see all 3 functions listed:
   - `properties-crud`
   - `events-crud`
   - `businesses-crud`

2. ✅ Each function should show as "Active" or "Deployed"

3. ✅ You can click on each function to see logs and details

---

## Quick Links

- **Functions Dashboard:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions
- **SQL Editor:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor
- **Table Editor:** https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/editor

---

## Troubleshooting

**"Function name already exists"**
- Click on the existing function
- Click "Edit"
- Update the code
- Click "Deploy"

**"Deployment failed"**
- Check the error message
- Make sure you copied ALL the code from the file
- Check for syntax errors in the code

**"Can't find the function file"**
- Make sure you're in the project root: `C:\Users\admin\Sunday Market Project`
- The files are in: `supabase/functions/[function-name]/index.ts`

---

**That's it!** Once all 3 functions are deployed, Phase 2 is complete! 🎉






