# Phase 1: Auth, Roles & Routing Audit

**Date:** 2024-12-19  
**Status:** IN PROGRESS  
**Auditor:** Senior Platform QA Lead  
**Scope:** Authentication, user roles, permissions, routing, and access control

---

## Executive Summary

This audit examines the authentication system, role definitions, routing logic, and access control mechanisms. The platform uses a multi-role system with some complexity around vendor/business relationships. Several critical issues and inconsistencies have been identified that require resolution before Phase 2.

**Overall Status:** ⚠️ **ISSUES IDENTIFIED** - Requires fixes before Phase 2

---

## 1. ROLE DEFINITION & PRECEDENCE

### 1.1 Identified Roles

Based on database schema and code analysis:

| Role | Database Source | Assignment Method | Priority |
|------|----------------|-------------------|----------|
| **Visitor** | N/A (logged out) | Default state | 0 (lowest) |
| **Customer** | `users.role = 'customer'` | Default on signup | 1 |
| **Vendor** | `users.role = 'vendor'` + `vendors` table | Signup via vendor flow | 2 |
| **Business User** | `users.role = 'business_user'` | Manual assignment? | 2 (alias for vendor?) |
| **Attendee User** | `users.role = 'attendee_user'` | Manual assignment? | 1 (lightweight) |
| **Admin** | `users.role = 'admin'` | Manual assignment | 3 |
| **Super User** | `super_users` table (separate) | Manual assignment | 4 (highest) |

### 1.2 Role Assignment Logic

**Customer (Default):**
- Assigned on user creation via trigger
- Default role in schema: `DEFAULT 'customer'`
- No explicit assignment needed

**Vendor:**
- Assigned via `signUpVendor()` function (`lib/auth/auth.ts`)
- Updates `users.role` to `'vendor'` (line 97-108)
- Creates `vendors` table record
- **Issue:** Role update happens AFTER vendor record creation, potential race condition

**Business User:**
- Defined in schema constraint (migration 010)
- **Issue:** No clear assignment logic found
- **Issue:** Comment says "alias for vendor" but no code implements this
- **Status:** UNUSED or INCOMPLETE

**Attendee User:**
- Defined in schema constraint (migration 010)
- **Issue:** No clear assignment logic found
- **Status:** UNUSED or INCOMPLETE

**Admin:**
- Manual assignment required
- Checked via `isAdmin()` / `isAdminServer()` functions
- **Issue:** No self-service admin assignment (security by design)

**Super User:**
- Separate table: `super_users`
- Checked via `isSuperUser()` / `isSuperUserServer()` functions
- **Issue:** Separate from `users.role`, creates dual-check complexity

### 1.3 Role Precedence & Conflicts

**Current Precedence (Inferred):**
1. Super User (highest - bypasses all)
2. Admin
3. Vendor / Business User (same level?)
4. Customer / Attendee User (same level?)
5. Visitor (lowest)

**Issues Identified:**

1. **Super User vs Admin:**
   - Super User checked separately from Admin
   - Functions like `isAdminOrSuperUser()` combine checks
   - **Issue:** Precedence unclear - can user be both?
   - **Issue:** Middleware only checks `admin` or `super_user` role, not `super_users` table

2. **Vendor vs Business User:**
   - Schema allows both `'vendor'` and `'business_user'` roles
   - Comment says `business_user` is "alias for vendor"
   - **Issue:** No code implements alias logic
   - **Issue:** Vendor check uses `vendors` table, not role
   - **Risk:** User could have `business_user` role but no vendor record

3. **Multiple Role Support:**
   - Schema: Single role per user (`users.role` is TEXT, not array)
   - **Issue:** No multi-role support
   - **Issue:** Cannot be vendor + admin simultaneously (must choose)

### 1.4 Role → Capabilities Matrix

| Capability | Visitor | Customer | Vendor | Business User | Attendee | Admin | Super User |
|------------|---------|----------|--------|---------------|----------|-------|------------|
| Browse public content | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create account | ✅ | N/A | N/A | N/A | N/A | N/A | N/A |
| Save/bookmark events | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| RSVP to events | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create vendor profile | ❌ | ❌ | N/A | ❌ | ❌ | ✅ | ✅ |
| Manage products | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| View vendor dashboard | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Access admin panel | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage all vendors | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Bypass RLS | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Issues:**
- Business User capabilities unclear (no implementation found)
- Attendee User capabilities unclear (no implementation found)

---

## 2. LOGIN → LANDING PAGE LOGIC

### 2.1 Current Login Flow

**File:** `app/auth/login/page.tsx`

**Flow:**
1. User submits credentials
2. `signInVendor()` called (line 48)
3. Function checks for vendor record (line 201-246)
4. If no vendor but `role === 'admin'`, returns mock vendor with `slug: 'admin'` (line 230-241)
5. Redirect logic (lines 69-77):
   - If `vendor.slug === 'admin'` → `/markets/admin`
   - If `vendor.slug` exists → `/markets/sellers/${slug}`
   - Otherwise → `/` (home)

### 2.2 Issues Identified

**CRITICAL ISSUE #1: Admin Detection Logic**
- Admin check happens in `signInVendor()` function
- Checks `users.role === 'admin'` (line 230)
- **Issue:** Does NOT check `super_users` table
- **Issue:** Super users without `admin` role won't be detected
- **Risk:** Super users may be redirected incorrectly

**CRITICAL ISSUE #2: Vendor-Only Redirect**
- Login page uses `signInVendor()` function
- Function name implies vendor-only
- **Issue:** What about regular customers? No customer login flow found
- **Issue:** Customer users may not have vendor records, causing errors

**CRITICAL ISSUE #3: Redirect Timing**
- Uses `window.location.href` with 1 second delay (line 77)
- Comment says "ensures auth cookies are persisted"
- **Issue:** Hardcoded delay is fragile
- **Issue:** No verification that cookies are actually set

**CRITICAL ISSUE #4: No Role-Based Landing Pages**
- Only checks: admin → admin panel, vendor → vendor profile
- **Issue:** No landing page for regular customers
- **Issue:** No landing page for business users
- **Issue:** No landing page for attendee users
- **Issue:** All non-admin/vendor users go to home page

### 2.3 Login → Redirect Decision Tree

**Current Logic:**
```
Login Success
  ├─ Has vendor record?
  │   ├─ Yes → Check role
  │   │   ├─ role === 'admin' → /markets/admin
  │   │   └─ role !== 'admin' → /markets/sellers/{slug}
  │   └─ No → Check role
  │       ├─ role === 'admin' → /markets/admin (mock vendor)
  │       └─ role !== 'admin' → ERROR (throws exception)
  └─ No vendor, not admin → ERROR
```

**Issues:**
- No path for customers without vendor records
- No path for business users
- No path for attendee users
- Super users not checked

**Expected Logic (Should Be):**
```
Login Success
  ├─ Check super_users table
  │   └─ Found → /markets/admin (highest priority)
  ├─ Check users.role
  │   ├─ 'admin' → /markets/admin
  │   ├─ 'vendor' → Check vendors table
  │   │   ├─ Has vendor record → /markets/sellers/{slug}
  │   │   └─ No vendor record → /markets/vendor/apply
  │   ├─ 'business_user' → /businesses (or vendor flow?)
  │   ├─ 'attendee_user' → /markets/discovery
  │   └─ 'customer' → /markets/discovery (or /markets/my-events)
  └─ No role → / (home)
```

### 2.4 Post-Login Behavior

**After Role Changes:**
- **Issue:** No logic found for handling role changes after login
- **Issue:** User would need to logout/login to see new role

**After Logout/Login:**
- Logout: `signOutVendor()` → clears session → redirects to `/` (line 201 in auth.ts)
- **Issue:** No redirect parameter preserved
- **Issue:** No "last visited" route tracking

**After Hard Refresh:**
- Auth state checked via `AuthContext`
- **Issue:** No redirect logic on refresh
- **Issue:** User stays on current page (may be unauthorized)

**After Session Expiry:**
- Supabase handles session expiry
- **Issue:** No explicit handling for expired sessions
- **Issue:** May show errors instead of redirecting to login

---

## 3. ROUTE GUARDS & PERMISSIONS

### 3.1 Protected Routes Analysis

**Middleware Protection (`middleware.ts`):**
- Routes: `/admin/*` and `/markets/admin/*`
- Check: `isAdminUser()` function
- Logic: Checks `users.role === 'admin'` OR `users.role === 'super_user'`
- **CRITICAL ISSUE:** Does NOT check `super_users` table
- **CRITICAL ISSUE:** Super users must have `role = 'super_user'` in users table to pass middleware

**Server-Side Protection:**
- Function: `requireAdmin()` in `lib/auth/server-admin-check.ts`
- Used in: All `/markets/admin/*` page components
- Logic: Checks `users.role === 'admin'` OR `users.role === 'super_user'`
- **CRITICAL ISSUE:** Same as middleware - doesn't check `super_users` table

**Client-Side Protection:**
- Function: `isAdminOrSuperUser()` in `lib/auth/admin.ts`
- Used in: Admin page client components
- Logic: Checks both `isAdmin()` AND `isSuperUser()` (OR logic)
- **Status:** ✅ Correctly checks both

**Vendor Dashboard Protection:**
- Route: `/markets/vendor/dashboard`
- File: `app/markets/vendor/dashboard/page.tsx`
- Logic: Checks for session, then checks for vendor record (lines 17-31)
- **Issue:** No role check - relies on vendor record existence
- **Issue:** Admin users without vendor records are redirected to `/markets/vendor/apply`
- **Risk:** Admin users may be incorrectly blocked

### 3.2 Route → Allowed Roles Matrix

| Route | Visitor | Customer | Vendor | Business User | Attendee | Admin | Super User | Protection Method |
|-------|---------|----------|--------|---------------|----------|-------|------------|-------------------|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/markets/discovery` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/markets/events/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/markets/my-events` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Client-side check |
| `/markets/vendor/dashboard` | ❌ | ❌ | ✅ | ❌ | ❌ | ⚠️ | ⚠️ | Server-side (vendor record) |
| `/markets/vendor/apply` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | None (public) |
| `/markets/admin/*` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ⚠️ | Middleware + Server |
| `/businesses` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/businesses/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/properties` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |
| `/properties/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | None (public) |

**Legend:**
- ✅ = Allowed
- ❌ = Blocked
- ⚠️ = Allowed but may have issues

**Critical Issues:**

1. **Admin Routes:**
   - Middleware checks `role === 'admin'` OR `role === 'super_user'`
   - **Issue:** Super users in `super_users` table but with `role = 'customer'` will be blocked
   - **Issue:** Inconsistent with client-side checks

2. **Vendor Dashboard:**
   - Checks for vendor record, not role
   - **Issue:** Admin users without vendor records redirected to apply page
   - **Issue:** Should allow admins to access

3. **My Events:**
   - Client-side check only
   - **Issue:** No server-side protection
   - **Issue:** Can be accessed via direct URL if user is logged in

### 3.3 Manual URL Entry Testing

**Test Cases:**

1. **Logged-out user → `/markets/admin`**
   - Expected: Redirect to `/auth/login?redirect=/markets/admin`
   - Actual: ✅ Works (middleware redirects)

2. **Customer → `/markets/admin`**
   - Expected: Redirect to login
   - Actual: ✅ Works (middleware blocks)

3. **Vendor → `/markets/admin`**
   - Expected: Redirect to login
   - Actual: ✅ Works (middleware blocks)

4. **Admin → `/markets/vendor/dashboard`**
   - Expected: Should allow (admin can access vendor dashboard)
   - Actual: ❌ Redirects to `/markets/vendor/apply` (no vendor record)

5. **Super User (role='customer') → `/markets/admin`**
   - Expected: Should allow (super user)
   - Actual: ❌ Blocked (middleware doesn't check super_users table)

### 3.4 Bookmarked Routes

**Issue:** No handling for:
- Expired sessions on bookmarked routes
- Role changes after bookmarking
- Deleted vendor records

---

## 4. NAVIGATION & UI VISIBILITY

### 4.1 Header Navigation

**File:** `components/ui/Header.tsx`

**Admin Check:**
- Line 10: Imports `isAdmin`
- Line 35: State `userIsAdmin`
- **Issue:** Admin check not found in visible code (may be in useEffect)

**Vendor Check:**
- Uses `useAuth()` hook
- Checks `vendor` object from context
- **Issue:** No explicit role check, relies on vendor record

**Navigation Items:**
- Public: Markets, Businesses, Properties, Concierge
- Vendor: Dashboard link (if vendor exists)
- Admin: Admin link (if admin)
- **Issue:** No customer-specific navigation
- **Issue:** No business user navigation
- **Issue:** No attendee user navigation

### 4.2 Action Buttons / CTAs

**Event Intent Buttons:**
- File: `components/ui/EventIntentButtons.tsx`
- Logic: Returns `null` if no user (line 77-79)
- **Status:** ✅ Correctly hidden for logged-out users

**RSVP Action:**
- File: `components/ui/RSVPAction.tsx`
- Logic: Shows "Sign in to RSVP" for logged-out (lines 107-121)
- **Status:** ✅ Correctly handles logged-out state

**Save Event:**
- Same as Event Intent Buttons
- **Status:** ✅ Correctly hidden for logged-out users

**Vendor Dashboard Link:**
- **Issue:** Only shown if vendor record exists
- **Issue:** Admin users without vendor records won't see link
- **Issue:** Should check role, not just vendor record

### 4.3 Dead-End Links

**Issues Found:**
- No obvious dead-end links
- **Issue:** Vendor dashboard link may redirect to apply page (confusing)

---

## 5. END-TO-END FUNCTIONAL FLOWS

### 5.1 Customer Flow

**Path:** Visitor → Signup → Customer → Browse → Save/RSVP

**Issues:**
1. **Signup:** No customer-specific signup found (only vendor signup)
2. **Login:** Uses `signInVendor()` - may fail for customers
3. **Landing:** Goes to home page (no customer dashboard)
4. **My Events:** Accessible but no clear entry point

**Status:** ⚠️ **INCOMPLETE** - Customer flow not fully implemented

### 5.2 Vendor Flow

**Path:** Visitor → Vendor Signup → Vendor → Dashboard → Manage Products

**Issues:**
1. **Signup:** ✅ Works (`signUpVendor()`)
2. **Login:** ✅ Works (redirects to vendor profile)
3. **Dashboard:** ✅ Works (if vendor record exists)
4. **Product Management:** ✅ Works (vendor dashboard)

**Status:** ✅ **MOSTLY COMPLETE** - Vendor flow works

### 5.3 Admin Flow

**Path:** Visitor → Login → Admin → Admin Panel

**Issues:**
1. **Login:** ✅ Works (detects admin role)
2. **Redirect:** ✅ Works (goes to `/markets/admin`)
3. **Access:** ✅ Works (middleware + server checks)
4. **Vendor Dashboard:** ❌ Blocked (no vendor record)

**Status:** ✅ **MOSTLY COMPLETE** - Admin flow works but vendor dashboard access issue

### 5.4 Super User Flow

**Path:** Visitor → Login → Super User → Admin Panel

**Issues:**
1. **Login:** ⚠️ May not detect super user (doesn't check super_users table)
2. **Redirect:** ⚠️ May redirect incorrectly
3. **Access:** ❌ Blocked by middleware if role != 'admin' or 'super_user'
4. **Client-side:** ✅ Works (checks super_users table)

**Status:** ❌ **BROKEN** - Super user flow has critical issues

---

## 6. ROLE CHANGES & EDGE CASES

### 6.1 User → Vendor Conversion

**Current Logic:**
- No conversion flow found
- User would need to signup again as vendor
- **Issue:** Cannot convert existing customer to vendor
- **Issue:** Would create duplicate account

**Expected:**
- Application flow at `/markets/vendor/apply`
- **Issue:** Flow not fully implemented or reviewed

### 6.2 Vendor + Admin Combinations

**Current Logic:**
- Schema: Single role per user
- **Issue:** Cannot be both vendor and admin
- **Issue:** Admin users cannot access vendor dashboard (no vendor record)

**Expected Behavior:**
- Admin should be able to access vendor dashboard
- Admin should be able to manage any vendor
- **Issue:** Current implementation blocks this

### 6.3 Role Downgrade/Removal

**Current Logic:**
- No logic found for role changes
- **Issue:** No handling for role removal
- **Issue:** User would need to logout/login to see changes

### 6.4 Partial Onboarding

**Current Logic:**
- Vendor signup creates both user and vendor record
- **Issue:** What if vendor record creation fails but user is created?
- **Issue:** User would have `role = 'vendor'` but no vendor record
- **Issue:** Login would fail (throws error at line 245)

### 6.5 Cached Auth State Issues

**Current Logic:**
- `AuthContext` manages auth state
- **Issue:** No explicit cache invalidation on role changes
- **Issue:** User may see stale role information

---

## 7. PHASE 1 COMPLETION CRITERIA

### 7.1 Current vs Expected Behavior

**Documented Above:** ✅ Complete

### 7.2 Root Causes Identified

**Critical Issues:**

1. **Super User Detection:**
   - Root Cause: Middleware and server checks don't query `super_users` table
   - Impact: Super users blocked from admin routes
   - Location: `middleware.ts` line 44, `server-admin-check.ts` line 36

2. **Customer Login Flow:**
   - Root Cause: Only vendor login exists, no customer login
   - Impact: Customers cannot log in
   - Location: `app/auth/login/page.tsx` uses `signInVendor()`

3. **Admin Vendor Dashboard Access:**
   - Root Cause: Vendor dashboard checks for vendor record, not role
   - Impact: Admins blocked from vendor dashboard
   - Location: `app/markets/vendor/dashboard/page.tsx` lines 23-31

4. **Role Precedence:**
   - Root Cause: Super user checked separately, not integrated
   - Impact: Inconsistent access control
   - Location: Multiple files

5. **Unused Roles:**
   - Root Cause: `business_user` and `attendee_user` defined but not used
   - Impact: Confusion, potential future issues
   - Location: Schema migrations

### 7.3 Required Fixes

**BLOCKERS (Must Fix Before Phase 2):**

1. **Fix Super User Detection in Middleware**
   - Update `middleware.ts` to check `super_users` table
   - Or require super users to have `role = 'super_user'` in users table

2. **Fix Super User Detection in Server Checks**
   - Update `server-admin-check.ts` to check `super_users` table
   - Use `isAdminOrSuperUserServer()` consistently

3. **Implement Customer Login Flow**
   - Create customer login function or make login role-agnostic
   - Add customer landing page logic

4. **Fix Admin Vendor Dashboard Access**
   - Update vendor dashboard to allow admins
   - Check role in addition to vendor record

5. **Clarify Role Definitions**
   - Remove or implement `business_user` role
   - Remove or implement `attendee_user` role
   - Document role usage

**RECOMMENDED (Should Fix):**

6. **Improve Login Redirect Logic**
   - Check super_users table in login flow
   - Add customer landing page
   - Add business user landing page
   - Add attendee user landing page

7. **Unify Role Checking**
   - Create single source of truth for role checks
   - Use consistent functions across codebase

8. **Handle Role Changes**
   - Add logic to handle role changes after login
   - Invalidate auth cache on role changes

### 7.4 Auth, Roles, and Routing Stability

**Current Status:** ⚠️ **UNSTABLE**

**Issues Preventing Stability:**
- Super user detection broken
- Customer login missing
- Admin vendor dashboard access broken
- Inconsistent role checking
- Unused roles causing confusion

**Required for Stability:**
- Fix all BLOCKERS above
- Test all role combinations
- Verify all protected routes
- Document role precedence clearly

---

## Phase 1 Summary

**Status:** ⚠️ **ISSUES IDENTIFIED - FIXES REQUIRED**

**Critical Issues:** 5  
**Recommended Fixes:** 3  
**Overall Stability:** UNSTABLE

**Next Steps:**
1. Fix all BLOCKERS
2. Test fixes thoroughly
3. Re-audit affected areas
4. Proceed to Phase 2 only after stability confirmed

---

**Phase 1 Audit Complete** ⚠️



