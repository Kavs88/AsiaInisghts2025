# Circular Dependency Fix - Admin RLS Policies

## 🔴 Problem Found (QA Pass 1)

### The Issue:
The "Admins can view all users" policy had a **circular dependency**:

```sql
EXISTS (
  SELECT 1 FROM public.users u
  WHERE u.id = auth.uid() AND u.role = 'admin'
)
```

**Why this fails:**
1. To check if you're an admin, the policy needs to read from `users` table
2. But to read from `users` table, RLS checks if you're an admin
3. **Circular dependency!** The policy can't check itself

### Root Cause:
RLS policies can't query the same table they're protecting without creating a circular dependency.

## ✅ Solution (QA Pass 2)

### Use `is_admin()` Function:
The `is_admin()` function has `SECURITY DEFINER`, which means it **bypasses RLS** when checking the users table.

```sql
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (is_admin(auth.uid()));
```

**Why this works:**
1. `is_admin(auth.uid())` is a function with `SECURITY DEFINER`
2. It runs with elevated privileges (bypasses RLS)
3. It can read the `users` table to check the role
4. Returns `true` if user is admin, `false` otherwise
5. No circular dependency!

## Implementation

Run this SQL script:

**File**: `supabase/fix_admin_rls_circular_dependency.sql`

This will:
1. ✅ Drop all existing admin policies (that have circular dependency)
2. ✅ Recreate them using `is_admin()` function
3. ✅ Verify the function exists
4. ✅ Test the function

## What Gets Fixed

### Before (Broken):
- ❌ "Admins can view all users" - Circular dependency
- ❌ Policy tries to query `users` table to check admin
- ❌ RLS blocks the query
- ❌ `isAdmin()` check fails

### After (Fixed):
- ✅ "Admins can view all users" - Uses `is_admin()` function
- ✅ Function bypasses RLS (SECURITY DEFINER)
- ✅ Can check admin role without circular dependency
- ✅ `isAdmin()` check works

## How It Works

### The Flow:
1. User queries `users` table
2. RLS checks: `is_admin(auth.uid())`
3. Function executes with `SECURITY DEFINER` (bypasses RLS)
4. Function reads `users` table directly (no RLS check)
5. Returns `true` if `role = 'admin'`
6. RLS policy allows access

### Why SECURITY DEFINER Works:
- Functions with `SECURITY DEFINER` run with the privileges of the function owner (usually `postgres`)
- They bypass RLS policies
- They can read any table
- Perfect for admin checks!

## Verification

After running the SQL:

1. **Check the verification query** at the end - Should show your admin status
2. **Go to `/admin/debug`** - Should show "Is Admin: ✅ Yes"
3. **Go to `/admin`** - Should show dashboard
4. **Check browser console** - Should see `[isAdmin] Admin check result: { isAdmin: true }`

## Expected Results

### SQL Verification Query:
```
current_user_id | is_admin_result | status
----------------|-----------------|------------------
uuid-here       | true            | ✅ You are an admin
```

### Browser Console:
```
[isAdmin] Checking admin role for authenticated user: { id: '...', email: '...' }
[isAdmin] Admin check result: { roleInDatabase: 'admin', isAdmin: true }
```

## Troubleshooting

### If `is_admin()` function doesn't exist:
Run `supabase/schema_safe.sql` first to create the function.

### If still not working:
1. **Verify function exists:**
   ```sql
   SELECT proname, prosecdef FROM pg_proc 
   WHERE proname = 'is_admin';
   ```
   Should show `prosecdef = true` (SECURITY DEFINER)

2. **Test function directly:**
   ```sql
   SELECT is_admin(auth.uid());
   ```
   Should return `true` if you're an admin

3. **Check browser console** for specific error messages

## Key Insight

**RLS policies can't query the same table they protect** - this creates a circular dependency. The solution is to use a `SECURITY DEFINER` function that bypasses RLS to perform the check.

This is a common pattern in PostgreSQL RLS:
- Use `SECURITY DEFINER` functions for admin checks
- Functions bypass RLS
- Policies call functions
- No circular dependency!





