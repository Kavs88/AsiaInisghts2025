# Login 406 Error & Redirect Hang - Fixes Applied

## Issue Identified

**Error:** `406 (Not Acceptable)` when querying vendors table for admin users  
**Symptom:** "signed in but just redirecting" - page hangs after login

### Root Cause

1. **Admin users don't have vendor records** (by design)
2. **Vendor query uses `.single()`** which throws 406 error when no record found
3. **Error handling exists but redirect might be waiting** for queries to complete
4. **Next.js router might have issues** with redirect timing

---

## Fixes Applied

### Fix 1: Use `.maybeSingle()` Instead of `.single()`
**File:** `lib/auth/auth.ts` (line 203)

**Changed:**
```typescript
// Before: .single() - throws error when no record
// After: .maybeSingle() - returns null when no record
.maybeSingle()
```

**Result:** No 406 error thrown for admin users

### Fix 2: Better Error Handling
**File:** `lib/auth/auth.ts` (lines 205-215)

**Added:**
- Explicit handling for 406 errors (expected for admins)
- Graceful fallback to admin check
- No error thrown for expected cases

### Fix 3: Use `window.location.href` for Redirect
**File:** `app/auth/login/page.tsx` (line 85)

**Changed:**
```typescript
// Before: router.replace(redirectPath)
// After: window.location.href = redirectPath
```

**Why:**
- More reliable than Next.js router
- Bypasses router timing issues
- Ensures full page reload with fresh session
- Cookies are definitely set before navigation

### Fix 4: Increased Redirect Delay
**File:** `app/auth/login/page.tsx` (line 82)

**Changed:**
- Delay increased from 200ms to 300ms
- Ensures cookies are fully set before redirect

---

## Expected Behavior After Fixes

### Before
1. User logs in
2. `signInVendor` queries vendors table
3. Gets 406 error (admin has no vendor record)
4. Error handled but redirect hangs
5. Page stuck on "redirecting"

### After
1. User logs in
2. `signInVendor` queries vendors table with `.maybeSingle()`
3. Returns null (no error thrown)
4. Admin check passes
5. Redirects using `window.location.href`
6. Page loads immediately

---

## Testing

### Test 1: Admin Login
- [ ] Login as admin
- [ ] No 406 error in console (or error is handled gracefully)
- [ ] Redirects to `/markets/admin` immediately
- [ ] Page loads successfully
- [ ] No "redirecting" hang

### Test 2: Vendor Login
- [ ] Login as vendor
- [ ] No errors
- [ ] Redirects to `/markets/sellers/${slug}` immediately
- [ ] Page loads successfully

### Test 3: Console Errors
- [ ] Check browser console
- [ ] 406 errors should be handled (may still show but won't block)
- [ ] No unhandled errors

---

## Additional Notes

### Why 406 Errors May Still Appear
- Browser console may still show 406 errors
- This is expected - the error happens, we catch it
- The important thing is it doesn't block the redirect
- Using `window.location.href` ensures redirect happens regardless

### Why `window.location.href` Instead of `router.replace()`
- `window.location.href` forces full page reload
- Ensures fresh session state
- Bypasses Next.js router timing issues
- More reliable for auth redirects

---

## Files Modified

1. ✅ `lib/auth/auth.ts` - Changed `.single()` to `.maybeSingle()` and improved error handling
2. ✅ `app/auth/login/page.tsx` - Changed redirect method to `window.location.href`

---

**Status:** ✅ Fixes Applied - Ready for Testing






