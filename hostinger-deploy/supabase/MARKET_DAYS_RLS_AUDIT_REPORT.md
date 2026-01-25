# Market Days RLS Security Audit Report

**Date:** Generated on audit execution  
**Table:** `public.market_days`  
**Auditor:** Senior Supabase Security Engineer

---

## Executive Summary

This audit examines Row Level Security (RLS) policies for the `market_days` table to ensure compliance with security requirements. The audit identified **3 missing policies** that need to be implemented to meet security standards.

---

## Security Requirements

1. ✅ **Only admins can INSERT, UPDATE, DELETE market days**
2. ✅ **Service role must retain full access** (automatic - service role bypasses RLS)
3. ✅ **Public users can SELECT only published market days**
4. ✅ **Vendors must have zero write access**

---

## Current Policy Audit

### Existing Policies

| Operation | Policy Name | Access Level | Status |
|-----------|-------------|--------------|--------|
| SELECT | "Published market days are publicly viewable" | Public (published only) | ✅ **CORRECT** |

### Missing Policies

| Operation | Required Policy | Status |
|-----------|----------------|--------|
| INSERT | Admin only | ❌ **MISSING** |
| UPDATE | Admin only | ❌ **MISSING** |
| DELETE | Admin only | ❌ **MISSING** |

---

## Current State Analysis

### ✅ What's Working

1. **RLS is enabled** on `market_days` table
2. **SELECT policy is correct**: Public users can only view published market days (`is_published = TRUE`)
3. **Service role access**: Service role automatically bypasses RLS (no policy needed)

### ❌ Security Gaps

1. **No INSERT policy**: Currently, only service role can insert (via bypass). Need admin policy for authenticated admin users.
2. **No UPDATE policy**: Currently, only service role can update (via bypass). Need admin policy for authenticated admin users.
3. **No DELETE policy**: Currently, only service role can delete (via bypass). Need admin policy for authenticated admin users.

### ⚠️ Current Behavior

- **Public users**: Can SELECT published market days only ✅
- **Vendors**: Can SELECT published market days only (no write access) ✅
- **Admins**: Can SELECT published market days, but **cannot INSERT/UPDATE/DELETE** via anon key ❌
- **Service role**: Full access (bypasses RLS) ✅

---

## Risk Assessment

### Current Risks

**Medium Risk**: While service role can perform all operations, authenticated admin users using the anon key cannot manage market days through the application. This forces all admin operations to use service role, which may not be ideal for audit trails and user context.

### Impact

- Admins cannot create/edit/delete market days through normal application flows
- All admin operations must use service role key (server-side only)
- No granular audit trail for admin actions via RLS policies

---

## Recommended Fix

### Implementation Plan

1. **Add INSERT policy** for admins only
2. **Add UPDATE policy** for admins only  
3. **Add DELETE policy** for admins only
4. **Verify** all policies are correctly applied

### Policy Details

All admin policies will use the existing `is_admin(auth.uid())` function to check if the authenticated user has admin role.

---

## Fix Script

The complete fix script is available in: **`supabase/audit_market_days_rls.sql`**

### Quick Fix (Run this in Supabase SQL Editor)

```sql
-- Enable RLS (should already be enabled)
ALTER TABLE public.market_days ENABLE ROW LEVEL SECURITY;

-- Admin INSERT policy
DROP POLICY IF EXISTS "Admins can insert market days" ON public.market_days;
CREATE POLICY "Admins can insert market days" ON public.market_days
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Admin UPDATE policy
DROP POLICY IF EXISTS "Admins can update market days" ON public.market_days;
CREATE POLICY "Admins can update market days" ON public.market_days
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Admin DELETE policy
DROP POLICY IF EXISTS "Admins can delete market days" ON public.market_days;
CREATE POLICY "Admins can delete market days" ON public.market_days
  FOR DELETE
  USING (is_admin(auth.uid()));
```

---

## Verification Queries

After applying the fix, run these queries to verify:

### 1. Check All Policies Exist

```sql
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Public (published only)'
    WHEN cmd = 'INSERT' THEN 'Admin only'
    WHEN cmd = 'UPDATE' THEN 'Admin only'
    WHEN cmd = 'DELETE' THEN 'Admin only'
  END as access_level
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
ORDER BY 
  CASE cmd
    WHEN 'SELECT' THEN 1
    WHEN 'INSERT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END;
```

**Expected Result:** 4 policies (SELECT, INSERT, UPDATE, DELETE)

### 2. Verify RLS is Enabled

```sql
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'market_days';
```

**Expected Result:** `rls_enabled = true`

### 3. Count Policies by Operation

```sql
SELECT 
  cmd as operation,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'market_days'
GROUP BY cmd;
```

**Expected Result:**
- SELECT: 1 policy
- INSERT: 1 policy
- UPDATE: 1 policy
- DELETE: 1 policy

---

## Post-Fix Expected Behavior

### ✅ Public Users (anon key)
- **SELECT**: ✅ Can view published market days only
- **INSERT**: ❌ Blocked (no policy allows)
- **UPDATE**: ❌ Blocked (no policy allows)
- **DELETE**: ❌ Blocked (no policy allows)

### ✅ Vendors (anon key, vendor role)
- **SELECT**: ✅ Can view published market days only
- **INSERT**: ❌ Blocked (admin only)
- **UPDATE**: ❌ Blocked (admin only)
- **DELETE**: ❌ Blocked (admin only)

### ✅ Admins (anon key, admin role)
- **SELECT**: ✅ Can view published market days only
- **INSERT**: ✅ Allowed (admin policy)
- **UPDATE**: ✅ Allowed (admin policy)
- **DELETE**: ✅ Allowed (admin policy)

### ✅ Service Role (service_role key)
- **SELECT**: ✅ Full access (bypasses RLS)
- **INSERT**: ✅ Full access (bypasses RLS)
- **UPDATE**: ✅ Full access (bypasses RLS)
- **DELETE**: ✅ Full access (bypasses RLS)

---

## Testing Recommendations

### Test Cases

1. **Public User Test**
   - ✅ Should see published market days
   - ❌ Should NOT see unpublished market days
   - ❌ Should NOT be able to insert/update/delete

2. **Vendor User Test**
   - ✅ Should see published market days
   - ❌ Should NOT be able to insert/update/delete

3. **Admin User Test**
   - ✅ Should see published market days
   - ✅ Should be able to insert new market days
   - ✅ Should be able to update existing market days
   - ✅ Should be able to delete market days

4. **Service Role Test**
   - ✅ Should have full access to all operations
   - ✅ Should bypass all RLS policies

---

## Compliance Status

| Requirement | Status | Notes |
|-------------|--------|-------|
| Only admins can INSERT | ⚠️ **PENDING** | Policy missing - fix script provided |
| Only admins can UPDATE | ⚠️ **PENDING** | Policy missing - fix script provided |
| Only admins can DELETE | ⚠️ **PENDING** | Policy missing - fix script provided |
| Service role full access | ✅ **COMPLIANT** | Automatic (bypasses RLS) |
| Public SELECT published only | ✅ **COMPLIANT** | Policy exists and correct |
| Vendors zero write access | ✅ **COMPLIANT** | No vendor write policies exist |

---

## Next Steps

1. ✅ Review this audit report
2. ⏳ Run the fix script: `supabase/audit_market_days_rls.sql`
3. ⏳ Verify policies using verification queries
4. ⏳ Test with different user roles
5. ⏳ Document any additional requirements

---

## Notes

- The `is_admin()` function is already defined and available for use
- Service role automatically bypasses RLS (no policy needed)
- All policies use `auth.uid()` to identify the current user
- The fix script is idempotent (safe to run multiple times)

---

**Report Generated:** See `supabase/audit_market_days_rls.sql` for executable audit and fix script.


