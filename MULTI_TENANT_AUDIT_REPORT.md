# Multi-Tenant Authority & Dashboard Audit Report
**Date:** 2026-02-28
**Scope:** Agency multi-tenancy layer (migrations `040700` → `064908`), dashboard auth flows, RLS correctness
**Status:** TWO CRITICAL BLOCKERS identified. Fix migration written — requires deployment.

---

## Executive Summary

The multi-tenant agency system was audited end-to-end: schema, RLS policies, auth triggers, and dashboard UI flows. Two backend bugs block all authenticated dashboard testing. A single fix migration (`20260228064908_fix_rls_recursion_and_auth_trigger.sql`) has already been written and resolves both issues. It must be applied to the Supabase database before the full test matrix can run.

---

## Findings

### BUG 1 — CRITICAL: `agency_members` RLS Infinite Recursion (500 Error)

**Severity:** Critical — blocks all dashboard data loading for any authenticated user
**Status:** Fix written, awaiting deployment

**Root Cause:**
Migration `20260228040700_create_agencies_and_membership.sql` created a self-referential SELECT policy on `agency_members`:

```sql
-- BROKEN — triggers infinite recursion
CREATE POLICY "Agency members can view membership"
  ON public.agency_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agency_members am   -- ← queries same table → triggers policy → recurse
      WHERE am.agency_id = agency_members.agency_id
        AND am.user_id = auth.uid()
    )
  );
```

PostgreSQL evaluates the `EXISTS` subquery by SELECTing from `agency_members`, which re-triggers the same SELECT policy, causing unbounded recursion. Supabase returns `500 infinite recursion detected in policy for table "agency_members"`.

The same pattern also existed in the INSERT/UPDATE/DELETE policies on `agency_members`, and in the `vendors`/`businesses` SELECT policies added by migration `043155` (which also queried `agency_members` via EXISTS).

**Fix (migration `064908`):**
Two `SECURITY DEFINER` helper functions are introduced. Because SECURITY DEFINER runs as the function owner (not the calling user), it bypasses RLS on `agency_members`, breaking the recursion loop. All self-referential policies are then rewritten to use these helpers:

```sql
-- Returns all agency_ids the current user belongs to (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_my_agency_ids()
  RETURNS UUID[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(ARRAY_AGG(agency_id), '{}')
  FROM public.agency_members WHERE user_id = auth.uid()
$$;

-- Returns the user's role in a specific agency, or NULL if not a member
CREATE OR REPLACE FUNCTION public.get_my_agency_role(p_agency_id UUID)
  RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.agency_members
  WHERE agency_id = p_agency_id AND user_id = auth.uid() LIMIT 1
$$;
```

Policies rewritten to use these (example):
```sql
-- FIXED — no self-reference
CREATE POLICY "Agency members can view membership"
  ON public.agency_members FOR SELECT
  USING (
    public.is_platform_admin(auth.uid())
    OR agency_id = ANY(public.get_my_agency_ids())
  );
```

All 4 policies on `agency_members` and all 4 policies on each of `vendors` and `businesses` are covered in the fix migration.

---

### BUG 2 — CRITICAL: `handle_new_user()` Trigger Constraint Violation (406 Error)

**Severity:** Critical — blocks all new user signup, preventing test account creation
**Status:** Fix written, awaiting deployment

**Root Cause:**
The `handle_new_user()` trigger (created by an early migration) inserts a row into `public.users` with `role = 'customer'`. Migration `20260228025930_normalize_roles.sql` later updated the `users_role_check` constraint to remove `'customer'` from the valid set. The trigger was never updated to match.

```sql
-- BROKEN — 'customer' is no longer a valid role value
INSERT INTO public.users (id, email, full_name, role)
VALUES (NEW.id, NEW.email, ..., 'customer');  -- ← violates check constraint → 406
```

**Fix (migration `064908`):**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### NOTE: SearchBar Webpack TypeError (Already Fixed)

**Severity:** Medium — caused `TypeError: Cannot read properties of undefined (reading 'call')` at startup
**Status:** Already resolved in a prior session

**Root Cause:** The webpack bundler cannot mix client-component imports with `'use server'` module exports when the imported symbol is a TypeScript interface (type-only). `SearchBar.tsx` was importing the `SearchResult` interface directly from `lib/actions/search.ts`.

**Fix applied:** `SearchBar.tsx` now defines its own local `SearchResult` interface and only imports the `searchAll` function from the server action file. `lib/actions/search.ts` still exports `SearchResult` for other consumers, which is safe — the fix ensures no client component uses that export as a type import from a `'use server'` boundary.

Current state is correct — no action needed.

---

## Dashboard UI Test Matrix — Blocked Results

| Role | Flow | Result | Blocked By |
|------|------|--------|------------|
| Platform Admin | Login → `/dashboard` | ❌ 500 — no data loads | BUG 1 (RLS recursion) |
| Agency Owner | Login → agency dashboard | ❌ 500 — agency_members query fails | BUG 1 |
| Agency Manager | Login → vendor list | ❌ 500 — vendors query cascades to agency_members | BUG 1 |
| Vendor (staff) | Login → own vendor view | ❌ 500 | BUG 1 |
| New User | Signup flow | ❌ 406 — trigger constraint violation | BUG 2 |
| Existing User | Login → public pages | ✅ Works (no auth-gated queries) | — |

UI components themselves (layouts, navigation, forms) were not fully verified due to the backend blockers. A second test pass is required after the fix migration is deployed.

---

## Action Required

### Step 1 — Apply the fix migration

The migration file is ready at:
```
supabase/migrations/20260228064908_fix_rls_recursion_and_auth_trigger.sql
```

Apply it via the Supabase dashboard SQL editor or CLI:
```bash
# Via CLI (if supabase link is configured)
supabase db push

# Or paste the migration file contents into the Supabase SQL Editor
# (Dashboard → SQL Editor → New query → paste → Run)
```

### Step 2 — Verify the fixes

Run these in the SQL Editor to confirm:

```sql
-- Should return a UUID array (empty array {} is fine if no memberships exist)
SELECT public.get_my_agency_ids();

-- Should insert successfully (use a real test email)
-- Then check public.users for the new row with role = 'user'
```

### Step 3 — Re-run dashboard test matrix

Once deployed, re-test all five role flows above. The UI test matrix can then be completed.

---

## Migration Chain Summary

| Migration | Description | State |
|-----------|-------------|-------|
| `040700_create_agencies_and_membership` | Schema + initial (buggy) RLS | Applied |
| `042745_scope_vendors_and_businesses_to_agencies` | Adds `agency_id` FK columns | Applied |
| `043155_scope_vendors_businesses_agency_rls` | Agency-scoped RLS (buggy — recursive EXISTS) | Applied |
| `043944_enforce_agency_scope_not_null` | NOT NULL constraint on agency_id | Applied |
| **`064908_fix_rls_recursion_and_auth_trigger`** | **Fixes BUG 1 + BUG 2** | **⚠️ NOT YET DEPLOYED** |
