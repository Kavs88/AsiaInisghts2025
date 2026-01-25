# Troubleshooting Signup Issues

## Issue: Connection Refused After Signup

If you're getting `ERR_CONNECTION_REFUSED` when trying to sign up or after signup redirects, here's how to fix it:

### 1. **Make Sure Dev Server is Running**

The dev server must be running on port 3001. Check if it's running:

```powershell
netstat -ano | findstr :3001
```

If you see `LISTENING`, the server is running. If not, start it:

```powershell
npm run dev
```

**Keep the terminal window open** - don't close it or the server will stop!

### 2. **Access the Correct URL**

Make sure you're accessing:
- **Signup page**: `http://localhost:3001/auth/signup`
- **Login page**: `http://localhost:3001/auth/login`
- **Homepage**: `http://localhost:3001`

**Note**: The app runs on port **3001**, not 3000!

### 3. **Check Database Setup**

Before signup will work, you need to run the SQL migrations:

1. **Run vendor signup policies** (REQUIRED):
   - Go to Supabase SQL Editor
   - Copy contents of `supabase/vendor_signup_policies.sql`
   - Paste and run

2. **Verify tables exist**:
   - Check that `users` and `vendors` tables exist in Supabase
   - Check that RLS policies are set up

### 4. **Common Signup Errors**

#### Error: "Failed to create user profile"
- **Cause**: RLS policies not set up
- **Fix**: Run `supabase/vendor_signup_policies.sql`

#### Error: "Vendor profile not found"
- **Cause**: Vendor record creation failed
- **Fix**: Check Supabase logs, verify RLS policies allow INSERT

#### Error: Connection refused after redirect
- **Cause**: Dev server stopped or crashed
- **Fix**: Restart dev server, keep terminal open

### 5. **How to Keep Server Running**

**Option A: Run in separate terminal**
```powershell
# Open new PowerShell window
cd "C:\Users\admin\Sunday Market Project"
npm run dev
# Keep this window open!
```

**Option B: Run in background (Windows)**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\admin\Sunday Market Project'; npm run dev"
```

### 6. **Verify Everything Works**

1. **Server running**: Visit `http://localhost:3001` - should see homepage
2. **Signup page**: Visit `http://localhost:3001/auth/signup` - should see form
3. **Database**: Check Supabase dashboard - tables should exist
4. **Policies**: Run `vendor_signup_policies.sql` if not done

### 7. **Test Signup Flow**

1. Go to `http://localhost:3001/auth/signup`
2. Fill in:
   - Vendor Name: "Test Vendor"
   - Email: "test@example.com"
   - Password: "password123" (8+ chars)
   - Confirm Password: "password123"
3. Click "Create Account"
4. Should redirect to `/vendors/test-vendor` (or similar)

### 8. **If Still Not Working**

Check browser console (F12) for errors:
- Network errors → Server not running
- Auth errors → Database/RLS issues
- Redirect errors → Server stopped during redirect

---

**Quick Fix**: Restart dev server and keep terminal open!





