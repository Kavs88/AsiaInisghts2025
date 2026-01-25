# Quick Start: Super User Setup

## ⚠️ IMPORTANT: Copy Only SQL Code

When copying SQL scripts, make sure you're copying **ONLY the SQL code**, not any task descriptions or markdown text.

## Step 1: Run Setup Script

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open the file: `supabase/setup_super_user_access_CLEAN.sql`
4. **Copy ONLY the SQL code** (everything from `-- ============================================` to the end)
5. Paste into SQL Editor
6. Click **Run** (or press Ctrl+Enter)

## Step 2: Find Your User ID

Run this query in SQL Editor:

```sql
SELECT 
    id as user_id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

Copy your `user_id` from the results.

## Step 3: Add Yourself as Super User

Replace `'YOUR_USER_ID_HERE'` with your actual user ID and run:

```sql
INSERT INTO public.super_users (uid, email, full_name, notes, created_by)
SELECT 
    u.id as uid,
    u.email,
    COALESCE(pu.full_name, u.email) as full_name,
    'Site owner - full access' as notes,
    u.id as created_by
FROM auth.users u
LEFT JOIN public.users pu ON u.id = pu.id
WHERE u.id = 'YOUR_USER_ID_HERE'
ON CONFLICT (uid) DO UPDATE
SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW()
RETURNING *;
```

## Step 4: Verify It Works

Run this (replace with your user ID):

```sql
SELECT 
    su.uid,
    su.email,
    is_super_user(su.uid) as is_super_user_check
FROM public.super_users su
WHERE su.uid = 'YOUR_USER_ID_HERE';
```

Should return `is_super_user_check = true`.

## Troubleshooting

**Error: "syntax error at or near 'Task'"**
- You copied non-SQL text (task description, markdown, etc.)
- Solution: Copy ONLY the SQL code from the `.sql` file

**Error: "relation 'super_users' does not exist"**
- Step 1 didn't run successfully
- Solution: Re-run `setup_super_user_access_CLEAN.sql`

**Error: "function is_super_user does not exist"**
- Step 1 didn't complete
- Solution: Re-run `setup_super_user_access_CLEAN.sql`


