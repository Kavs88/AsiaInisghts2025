# Hostinger Build Settings Review

## Current Configuration

### ✅ Correct Settings
- **Framework Preset**: Next.js ✓
- **Root Directory**: `./` ✓ (correct for standard Next.js structure)
- **Build and Output Settings**: Default for Next.js ✓

### ⚠️ Issues & Recommendations

#### 1. Node.js Version Compatibility
**Current**: Node 22.x  
**Recommendation**: **Node 18.x or 20.x**

**Why?**
- Your project uses Next.js 14.0.0
- Node 22.x is very new and may have compatibility issues
- Next.js 14 officially supports Node 18.17+ and Node 20.x
- Many hosting providers (including Hostinger) recommend Node 18 or 20 for stability

**Action**: Change Node version to **20.x** (LTS) in Hostinger settings

---

#### 2. Environment Variables (CRITICAL - Missing)

**Current**: None configured  
**Status**: ❌ **MUST ADD BEFORE DEPLOYMENT**

Your application requires these environment variables to function:

```env
# Required - Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk

# Optional but Recommended
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://saddlebrown-stinkbug-619379.hostingersite.com
```

**How to Add in Hostinger:**
1. In the deployment settings, find "Environment Variables" section
2. Click "Add" for each variable above
3. Enter the variable name and value
4. Save before deploying

**⚠️ Security Note**: 
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- `SUPABASE_SERVICE_ROLE_KEY` should be kept secret (server-side only)

---

#### 3. Build Command Verification

**Expected Build Command**: `npm run build`  
**Expected Start Command**: `npm start`

Your `package.json` confirms:
- ✅ `"build": "next build"` - Correct
- ✅ `"start": "next start"` - Correct

**Note**: Hostinger should auto-detect these from your `package.json`, but verify they're set correctly.

---

#### 4. Next.js Configuration Review

Your `next.config.js` has:
- ✅ `output: 'standalone'` - **Excellent for deployment!**
  - This creates a minimal production build
  - Reduces deployment size
  - Perfect for Hostinger

**Other Good Settings:**
- ✅ `swcMinify: true` - Fast minification
- ✅ `compress: true` - Gzip compression enabled
- ✅ `poweredByHeader: false` - Security best practice
- ✅ Image optimization configured
- ✅ Redirects properly configured

---

## Pre-Deployment Checklist

### Before Uploading/Deploying:

- [ ] **Change Node version to 20.x** (from 22.x)
- [ ] **Add all required environment variables** (see section 2 above)
- [ ] **Verify build command**: `npm run build`
- [ ] **Verify start command**: `npm start`
- [ ] **Update `NEXT_PUBLIC_APP_URL`** to match your actual domain:
  - Temporary: `https://saddlebrown-stinkbug-619379.hostingersite.com`
  - Production: Your final domain

### After Deployment:

- [ ] **Check Node.js App is created** in hPanel (Advanced → Node.js)
- [ ] **Verify dependencies installed** (`npm install` should run automatically)
- [ ] **Check build completed successfully** (look for `.next` folder)
- [ ] **Verify app is running** (Status should show "Running")
- [ ] **Test the site** at temporary domain

---

## Post-Deployment Steps (After Initial Upload)

Even with automatic deployment, you may need to:

1. **SSH into your server** (if available)
2. **Verify environment variables** are set:
   ```bash
   cd public_html
   cat .env.local  # or check in hPanel
   ```

3. **Manually build if needed**:
   ```bash
   cd public_html
   npm install
   npm run build
   ```

4. **Start the Node.js app** in hPanel:
   - Go to: Advanced → Node.js
   - Find your app
   - Click "Start"

---

## Common Issues & Solutions

### Issue: Build Fails
**Possible Causes:**
- Missing environment variables
- Node version incompatibility
- Missing dependencies

**Solution:**
- Check build logs in Hostinger
- Verify all environment variables are set
- Try Node 20.x instead of 22.x

### Issue: 403 Forbidden After Deployment
**Cause**: Node.js app not started or not configured

**Solution:**
- Go to hPanel → Advanced → Node.js
- Create/configure Node.js app
- Start the application
- See `RESOLVE_HOSTINGER_ISSUE.md` for detailed steps

### Issue: Environment Variables Not Working
**Solution:**
- Verify variables are set in Hostinger dashboard
- Check variable names match exactly (case-sensitive)
- Restart the Node.js app after adding variables

---

## Recommended Build Settings Summary

```
Framework Preset: Next.js
Node Version: 20.x (LTS) ⚠️ CHANGE FROM 22.x
Root Directory: ./
Build Command: npm run build (auto-detected)
Start Command: npm start (auto-detected)
Output Directory: .next (auto-detected)

Environment Variables:
  ✅ NEXT_PUBLIC_SUPABASE_URL
  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
  ✅ SUPABASE_SERVICE_ROLE_KEY (optional)
  ✅ NODE_ENV=production
  ✅ NEXT_PUBLIC_APP_URL
```

---

## Next Steps

1. **Update Node version** to 20.x in Hostinger settings
2. **Add environment variables** before deploying
3. **Upload/deploy** your `hostinger-deploy.zip`
4. **Monitor deployment** logs for any errors
5. **Configure Node.js app** in hPanel if needed
6. **Test** at temporary domain

---

## Additional Resources

- See `RESOLVE_HOSTINGER_ISSUE.md` for detailed troubleshooting
- See `HOSTINGER_DEPLOYMENT.md` for full deployment guide
- Check Hostinger documentation for Node.js app setup

---

**Last Updated**: Based on current project configuration  
**Project**: Sunday Market (Next.js 14.0.0)


