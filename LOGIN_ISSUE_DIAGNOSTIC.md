# Login Redirect Issue - Diagnostic & Rollback Guide

**Status:** Critical - Login redirect not working  
**User Action:** Getting outside help  
**Date:** December 29, 2025

---

## 🚨 Current Issue

- Login shows "signed in but just redirecting"
- Page hangs and doesn't load
- 406 error in console for vendor queries
- This worked before, now broken

---

## 📋 All Changes Made (For Rollback)

### Files Modified During This Session

1. **`middleware.ts`**
   - **Change:** Fixed `ADMIN_ROUTES` undefined error
   - **Line 58:** Changed from `ADMIN_ROUTES.some(...)` to direct path check
   - **Risk:** Low - This was a bug fix

2. **`app/auth/login/page.tsx`**
   - **Changes:**
     - Changed redirect paths (lines 61-67)
     - Added session verification (lines 50-61)
     - Changed redirect method to `window.location.href` (line 85)
     - Increased delay to 300ms (line 82)
   - **Risk:** High - These changes might have broken it

3. **`lib/auth/auth.ts`**
   - **Changes:**
     - Changed `.single()` to `.maybeSingle()` (line 203)
     - Added error handling for 406 errors (lines 205-215)
   - **Risk:** Medium - Might affect behavior

---

## 🔄 Quick Rollback Instructions

### Option 1: Revert Login Page to Previous Version

**File:** `app/auth/login/page.tsx`

**Revert to:**
```typescript
// Simple redirect - no session verification, no delays
router.replace(redirectPath)
```

**Original redirect paths:**
```typescript
if (userData?.role === 'admin' || result.vendor.slug === 'admin') {
  redirectPath = '/admin'  // Let the redirect page handle it
} else if (result.vendor?.slug && result.vendor.slug !== 'admin') {
  redirectPath = `/vendors/${result.vendor.slug}`  // Let redirect pages handle it
}
```

### Option 2: Check Git History

If you have git:
```bash
git log --oneline app/auth/login/page.tsx
git show <commit-hash>:app/auth/login/page.tsx > app/auth/login/page.tsx.backup
```

---

## 🔍 Diagnostic Steps

### Step 1: Check What's Actually Happening

**Open browser DevTools:**
1. Press F12
2. Go to Network tab
3. Try to login
4. Check:
   - What requests are being made?
   - Which ones are failing?
   - What's the response status?

### Step 2: Check Console Errors

**In DevTools Console:**
- Look for JavaScript errors
- Look for 406 errors
- Look for redirect loops
- Check if `window.location.href` is being called

### Step 3: Check Session

**In DevTools Application tab:**
- Go to Cookies
- Check if Supabase session cookies are set
- Check cookie values

### Step 4: Test Direct Navigation

**Manually navigate to:**
- `/markets/admin` (if admin)
- `/markets/sellers/[slug]` (if vendor)

**Does it load?**
- If yes: Redirect is the issue
- If no: Page itself has issues

---

## 🛠️ Potential Quick Fixes

### Fix 1: Remove All Delays and Verification

**File:** `app/auth/login/page.tsx`

Remove:
- Session verification (lines 50-61)
- Delay (line 82)

Keep only:
```typescript
router.replace(redirectPath)
```

### Fix 2: Use Original Redirect Paths

**Revert to:**
```typescript
redirectPath = '/admin'  // Instead of '/markets/admin'
redirectPath = `/vendors/${slug}`  // Instead of '/markets/sellers/${slug}'
```

Let the redirect pages handle the routing.

### Fix 3: Remove window.location.href

**Change back to:**
```typescript
router.replace(redirectPath)  // Instead of window.location.href
```

---

## 📝 What Worked Before

**Based on your statement "this has worked before":**

The previous version likely:
- Used `router.replace()` (not `window.location.href`)
- Used intermediate paths (`/admin`, `/vendors/${slug}`)
- Had no session verification delays
- Had simpler error handling

---

## 🔧 Minimal Working Version

**Simplest possible login redirect:**

```typescript
try {
  const result = await signInVendor(formData.email, formData.password)
  
  setToast({
    message: 'Login successful! Redirecting...',
    type: 'success',
    visible: true,
  })

  // Simple redirect - let redirect pages handle routing
  if (result.vendor.slug === 'admin') {
    router.replace('/admin')
  } else {
    router.replace(`/vendors/${result.vendor.slug}`)
  }
} catch (error: any) {
  // Error handling
}
```

---

## 📊 Comparison: Before vs After

### Before (Working)
- Simple `router.replace()`
- Intermediate paths (`/admin`, `/vendors/${slug}`)
- No delays
- No session verification
- Let redirect pages handle routing

### After (Broken)
- `window.location.href` (full page reload)
- Direct paths (`/markets/admin`, `/markets/sellers/${slug}`)
- 300ms delay
- Session verification
- Trying to handle everything in login page

---

## 🎯 Recommended Action

**Revert to simplest version:**

1. Remove session verification
2. Remove delays
3. Use `router.replace()` instead of `window.location.href`
4. Use original redirect paths
5. Let redirect pages handle routing

---

## 📁 Files to Check

1. `app/auth/login/page.tsx` - Main login logic
2. `lib/auth/auth.ts` - Auth functions
3. `middleware.ts` - Route protection
4. `app/admin/page.tsx` - Admin redirect
5. `app/vendors/[slug]/page.tsx` - Vendor redirect

---

## 🆘 For Outside Help

**Provide them with:**
1. This diagnostic document
2. Browser console errors
3. Network tab screenshots
4. What worked before
5. What changed

**Key Information:**
- Supabase project: `hkssuvamxdnqptyprsom`
- Error: 406 on vendor query for admin users
- Symptom: "redirecting" hang after login
- Previous behavior: Worked with simple redirects

---

**Status:** Diagnostic Complete - Ready for Rollback or External Help






