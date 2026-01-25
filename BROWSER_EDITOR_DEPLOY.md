# Deploy Edge Functions via Browser Editor

## Step-by-Step Instructions

### Step 1: Open Functions Dashboard
Go to: **https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom/functions**

### Step 2: Create Each Function

You need to create **3 functions**:

1. **properties-crud**
2. **events-crud**
3. **businesses-crud**

---

## For Each Function:

### 1. Click "Create a new function" (or similar button)

### 2. Enter Function Name
- **Function Name:** `properties-crud` (exactly as shown)
- Click "Create" or "Next"

### 3. Copy Code from Your Project

**For `properties-crud`:**
- Open file: `supabase/functions/properties-crud/index.ts`
- Select All (Ctrl+A)
- Copy (Ctrl+C)

**For `events-crud`:**
- Open file: `supabase/functions/events-crud/index.ts`
- Select All (Ctrl+A)
- Copy (Ctrl+C)

**For `businesses-crud`:**
- Open file: `supabase/functions/businesses-crud/index.ts`
- Select All (Ctrl+A)
- Copy (Ctrl+C)

### 4. Paste into Browser Editor
- Click in the code editor in the browser
- Paste (Ctrl+V)
- The code should appear in the editor

### 5. Deploy
- Click **"Deploy"** button
- Wait for success message
- Repeat for the other 2 functions

---

## Quick Reference: File Locations

All function code is in your project at:

```
C:\Users\admin\Sunday Market Project\
└── supabase\
    └── functions\
        ├── properties-crud\
        │   └── index.ts  ← Copy this
        ├── events-crud\
        │   └── index.ts  ← Copy this
        └── businesses-crud\
            └── index.ts  ← Copy this
```

---

## After Deployment

You should see all 3 functions listed:
- ✅ `properties-crud`
- ✅ `events-crud`
- ✅ `businesses-crud`

Each should show as "Active" or "Deployed"

---

## That's It!

Once all 3 functions are deployed, Phase 2 is complete! 🎉

You can then:
- Test the admin dashboard: http://localhost:3001/markets/admin
- Run E2E tests: `npm run test:e2e`






