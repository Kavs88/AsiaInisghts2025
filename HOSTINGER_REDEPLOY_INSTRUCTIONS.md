# Hostinger Re-deploy Instructions - Fix Build Failure

## 🔍 Problem

Build failed because:
- Pre-built `.next` folder may be causing conflicts
- Hostinger needs to build the app itself

## ✅ Solution: Use Clean Zip

I've created `hostinger-deploy-clean.zip` that:
- ✅ Excludes `.next` folder (let Hostinger build it)
- ✅ Excludes `supabase/functions` (prevents TypeScript errors)
- ✅ Includes all source files
- ✅ Includes `package-lock.json` for dependency resolution

---

## 🚀 Re-deploy Steps

### Step 1: Delete Current Deployment

1. Go to: **hPanel → Node.js Web Apps**
2. Find your deployment: `darksalmon-horse-629482.hostingersite.com`
3. Click **"Delete"** or **"Remove"** to delete the failed deployment

### Step 2: Create New Deployment

1. Click **"Add Website"** or **"Deploy New App"**
2. Select: **"Node.js Apps"**
3. Choose: **"Upload your website files"**

### Step 3: Upload Clean Zip

1. **Upload:** `hostinger-deploy-clean.zip` (NOT the old one)
2. Wait for upload to complete

### Step 4: Configure Settings

**Framework Preset:**
- ✅ Next.js (should auto-detect)

**Node Version:**
- ✅ **20.x** (change from 18.x if needed)

**Root Directory:**
- ✅ `./` (root)

**Build and Output Settings:**
- ✅ Click **"Change"** to verify:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Package Manager: `npm`

**Environment Variables:** ⚠️ **CRITICAL - Add these:**

1. `NEXT_PUBLIC_SUPABASE_URL` = `https://hkssuvamxdnqptyprsom.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`
3. `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_`
4. `NODE_ENV` = `production`
5. `NEXT_PUBLIC_APP_URL` = `https://darksalmon-horse-629482.hostingersite.com`

### Step 5: Deploy

1. Click **"Deploy"** or **"Save"**
2. **Wait 3-5 minutes** for build to complete
3. Check build logs if it fails again

---

## 🔍 If Build Still Fails

### Check Build Logs

1. Click on the deployment
2. Click **"Build logs"** or **"View logs"**
3. Look for specific errors:
   - TypeScript compilation errors
   - Missing dependencies
   - File not found errors
   - Build command failures

### Common Issues

**Issue: TypeScript Errors**
- Check if `supabase/functions` is still included
- Verify `tsconfig.json` excludes it

**Issue: Missing Dependencies**
- Ensure `package-lock.json` is in zip
- Check if all dependencies are listed in `package.json`

**Issue: Build Command Fails**
- Verify build command is: `npm run build`
- Check Node.js version (should be 20.x)

**Issue: Environment Variables Missing**
- Ensure all 5 variables are added
- Check for typos in variable names/values

---

## 📋 Quick Checklist

Before deploying:
- [ ] Deleted old failed deployment
- [ ] Using `hostinger-deploy-clean.zip` (NOT the old one)
- [ ] Node version: 20.x
- [ ] Build settings verified
- [ ] All 5 environment variables added
- [ ] Ready to deploy

---

## 🎯 Expected Result

After successful deployment:
- ✅ Build status: **Success**
- ✅ App accessible at: `https://darksalmon-horse-629482.hostingersite.com`
- ✅ No build errors in logs

---

**The clean zip excludes .next so Hostinger can build it fresh. This should fix the build failure!**


