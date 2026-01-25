# Hostinger Deployment Checklist - Node.js Web Apps Method

## ✅ Pre-Deployment Verification

### Package.json Requirements
- [x] `"start": "next start"` - Standard Next.js start (Hostinger handles PORT automatically)
- [x] `"build": "next build"` - Build script present
- [x] `"engines": { "node": ">=18.17.0" }` - Node version requirement declared
- [x] No `"main"` field - Not needed for auto-detection
- [x] No postinstall/preinstall hooks - Clean build process

### Hostinger Compatibility
- [x] `middleware.ts` has `export const runtime = 'nodejs'` - Explicit Node.js runtime
- [x] No Edge-only APIs in core routing/auth - All compatible
- [x] Server-side code uses Node.js runtime - Verified
- [x] Framework: Next.js (auto-detected by Hostinger)

### Environment Variable Safety
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Safely accessed with fallbacks
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safely accessed with fallbacks
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Server-only, properly guarded
- [x] All env vars fail gracefully if missing - No build crashes

### File Structure
- [x] `/app` - Next.js App Router present
- [x] `/public` - Static assets folder present
- [x] `/middleware.ts` - Middleware file present
- [x] `/next.config.js` - Next.js config present
- [x] `/package.json` - Package file present
- [x] No `server.js` - Not needed for auto-detection method
- [x] Standard Next.js structure - Optimized for auto-detection

### Build Stability
- [x] No unguarded `window` usage on server - All in client components
- [x] No unguarded `document` access during build - All properly guarded
- [x] Browser-only APIs properly isolated - Verified

---

## 🚀 Deployment Steps (Node.js Web Apps Method)

### Step 1: Access Node.js Web Apps
1. Login to **Hostinger hPanel**
2. Navigate to: **Websites** → **Add Website**
3. Select: **Node.js Apps**

### Step 2: Upload Your Project
1. Choose: **Upload your website files**
2. Upload: `hostinger-deploy-ready.zip`
3. Wait for upload to complete

### Step 3: Configure Build Settings
Hostinger will **auto-detect** Next.js and suggest settings:

**Verify/Edit these settings:**
- **Framework Preset**: Next.js (auto-detected)
- **Node Version**: 20.x (or 18.x, 22.x, 24.x)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Package Manager**: `npm` (auto-detected)

**These should be auto-detected correctly - just verify!**

### Step 4: Set Environment Variables
In the deployment settings, add these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` = `https://hkssuvamxdnqptyprsom.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk`
- `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_`
- `NODE_ENV` = `production`
- `NEXT_PUBLIC_APP_URL` = `https://saddlebrown-stinkbug-619379.hostingersite.com`

### Step 5: Deploy
1. Click: **Deploy** button
2. Hostinger will automatically:
   - Extract your files
   - Run `npm install`
   - Run `npm run build`
   - Start the application
3. Wait for deployment to complete
4. Your app will be deployed to a temporary subdomain

### Step 6: Test Your Site
1. Visit the temporary subdomain provided by Hostinger
2. Check browser console (F12) for errors
3. Test key functionality

---

## 🔍 Post-Deployment Verification

### Check These:
- [ ] Deployment status: "Deployed" or "Running"
- [ ] Site loads without errors
- [ ] No console errors in browser
- [ ] Environment variables accessible
- [ ] API routes working
- [ ] Authentication working

### View Deployment Details
- Click **"See details"** in your website dashboard
- View build logs if deployment failed
- Check deployment status

---

## ⚠️ Troubleshooting

### If Build Fails:
- Check build logs in deployment details
- Verify Node.js version (must be >= 18.17.0)
- Verify all dependencies in package.json
- Check for TypeScript errors

### If Deployment Fails:
- Check deployment logs for specific errors
- Verify environment variables are set correctly
- Ensure package.json has correct scripts
- Verify file structure is standard Next.js

### If Site Shows Errors:
- Verify all environment variables are set
- Check browser console for client-side errors
- Verify Supabase connection
- Check deployment logs in Hostinger dashboard

---

## ✅ Deployment Confirmation

**This build is SAFE to upload to Hostinger using Node.js Web Apps method.**

All requirements met:
- ✅ Package.json optimized for auto-detection
- ✅ Hostinger compatibility ensured
- ✅ Environment variables safely handled
- ✅ File structure verified (standard Next.js)
- ✅ Build stability confirmed
- ✅ No server.js needed (auto-detection method)

**Package:** `hostinger-deploy-ready.zip`  
**Status:** Ready for deployment  
**Method:** Node.js Web Apps (auto-detection)  
**Confidence:** High - All checks passed

---

## 📝 Key Differences from Old Method

**Old Method (Advanced → Node.js):**
- Required manual Node.js app creation
- Needed `server.js` file
- Required `"main": "server.js"` in package.json
- Manual start/stop of app

**New Method (Node.js Web Apps):**
- Auto-detects Next.js framework
- No `server.js` needed
- No `"main"` field needed
- Automatic build and deployment
- Simpler and more reliable

---

**Proceed with deployment using the Node.js Web Apps method above.**
