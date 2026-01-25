# Login Redirect - Comparison Analysis

**Date:** December 29, 2025  
**Issue:** Login redirect not working after fix

---

## 🔍 Key Differences

### Working Version (`login-simple/page.tsx`)

**Auth Method:**
```typescript
// Direct Supabase auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
})

// Check role from users table
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single()

if (userData?.role === 'admin') {
  setTimeout(() => {
    router.push('/admin')  // Intermediate route
  }, 1000)
}
```

**Key Points:**
- ✅ Uses direct `supabase.auth.signInWithPassword()`
- ✅ Checks `users.role` directly from database
- ✅ Uses `router.push('/admin')` (intermediate route)
- ✅ Has `setTimeout(1000)` delay
- ✅ Uses intermediate paths (`/admin`, `/vendors/${slug}`)

---

### Current Version (`login/page.tsx`)

**Auth Method:**
```typescript
// Uses signInVendor() wrapper
const result = await signInVendor(formData.email, formData.password)

// Checks synthetic vendor.slug
if (result.vendor.slug === 'admin') {
  window.location.href = '/markets/admin'  // Direct route
}
```

**Key Points:**
- ❌ Uses `signInVendor()` wrapper function
- ❌ Checks `result.vendor.slug === 'admin'` (synthetic value)
- ❌ Uses `window.location.href` (full reload)
- ❌ No delay
- ❌ Direct paths (`/markets/admin`, `/markets/sellers/${slug}`)

---

## 🐛 Potential Issues

### Issue 1: Timing Problem

**Current Code:**
```typescript
const result = await signInVendor(...)
window.location.href = '/markets/admin'  // Immediate redirect
```

**Problem:**
- `window.location.href` executes **immediately** after `signInVendor()` returns
- But Supabase auth cookies might not be fully persisted yet
- Middleware runs before cookies are readable
- Result: Middleware sees unauthenticated user → redirects to login

**Working Version:**
```typescript
setTimeout(() => {
  router.push('/admin')  // 1 second delay
}, 1000)
```

**Why This Works:**
- `setTimeout` gives time for cookies to be set
- `router.push()` is client-side navigation (faster than full reload)
- Intermediate route (`/admin`) has redirect page that handles final routing

---

### Issue 2: signInVendor() Return Value

**Current Code:**
```typescript
if (result.vendor.slug === 'admin') {
  window.location.href = '/markets/admin'
}
```

**Problem:**
- `signInVendor()` returns a synthetic vendor object for admins:
  ```typescript
  vendor: {
    id: data.user.id,
    slug: 'admin',  // Synthetic value
    name: 'Admin',
  }
  ```
- This might not match the actual user state
- The check might be unreliable

**Working Version:**
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single()

if (userData?.role === 'admin') {  // Direct database check
```

**Why This Works:**
- Checks actual database value
- More reliable than synthetic vendor object

---

### Issue 3: Direct vs Intermediate Routes

**Current Code:**
```typescript
window.location.href = '/markets/admin'  // Direct to final destination
```

**Problem:**
- Goes directly to `/markets/admin`
- Middleware intercepts immediately
- If cookies aren't ready, middleware blocks it

**Working Version:**
```typescript
router.push('/admin')  // Intermediate route
// /admin page redirects to /markets/admin
```

**Why This Works:**
- Intermediate route (`/admin`) might not be protected by middleware
- Or middleware has time to read cookies by the time redirect happens
- Redirect page handles final routing server-side

---

## 💡 Recommended Fix

### Option 1: Add Delay to window.location.href

```typescript
const result = await signInVendor(formData.email, formData.password)

setToast({
  message: 'Login successful! Redirecting...',
  type: 'success',
  visible: true,
})

// Wait for cookies to be set before redirect
setTimeout(() => {
  if (result.vendor.slug === 'admin') {
    window.location.href = '/markets/admin'
  } else if (result.vendor?.slug) {
    window.location.href = `/markets/sellers/${result.vendor.slug}`
  } else {
    window.location.href = '/'
  }
}, 1000)  // Add delay
```

### Option 2: Use Working Pattern (Recommended)

```typescript
const result = await signInVendor(formData.email, formData.password)

setToast({
  message: 'Login successful! Redirecting...',
  type: 'success',
  visible: true,
})

// Check role directly from database (more reliable)
const supabase = createClient()
const { data: userData } = await supabase
  .from('users')
  .select('role')
  .eq('id', result.user.id)
  .single()

if (userData?.role === 'admin') {
  setTimeout(() => {
    router.push('/admin')  // Use intermediate route
  }, 1000)
} else if (result.vendor?.slug) {
  setTimeout(() => {
    router.push(`/vendors/${result.vendor.slug}`)
  }, 1000)
} else {
  setTimeout(() => {
    router.push('/')
  }, 1000)
}
```

### Option 3: Hybrid Approach

```typescript
const result = await signInVendor(formData.email, formData.password)

setToast({
  message: 'Login successful! Redirecting...',
  type: 'success',
  visible: true,
})

// Wait for cookies, then use full reload
setTimeout(() => {
  if (result.vendor.slug === 'admin') {
    window.location.href = '/markets/admin'
  } else if (result.vendor?.slug) {
    window.location.href = `/markets/sellers/${result.vendor.slug}`
  } else {
    window.location.href = '/'
  }
}, 1500)  // Longer delay to ensure cookies are set
```

---

## 🎯 Root Cause Hypothesis

**Most Likely Issue:**
`window.location.href` is executing **too quickly** - before Supabase auth cookies are fully persisted in the browser. When middleware runs on `/markets/admin`, it doesn't see the authenticated session yet.

**Solution:**
Add a delay before `window.location.href` to give cookies time to be set, OR use the working pattern from `login-simple` (intermediate routes with `router.push()` and delay).

---

## ✅ Recommended Action

**Use Option 2** (Working Pattern):
- Check role directly from database
- Use intermediate routes (`/admin`, `/vendors/${slug}`)
- Use `router.push()` with `setTimeout(1000)`
- This matches the proven working pattern






