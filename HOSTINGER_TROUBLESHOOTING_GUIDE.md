# Hostinger Deployment Troubleshooting Guide

## ✅ Package Verification Complete

All critical files are present and verified:

### Root Files (All Present)
- ✅ `package.json` - Has `"main": "server.js"` and `"start": "node server.js"`
- ✅ `server.js` - Entry file exists and matches package.json
- ✅ `package-lock.json` - Dependency lock file
- ✅ `next.config.js` - Next.js configuration
- ✅ `tsconfig.json` - TypeScript config
- ✅ `middleware.ts` - Next.js middleware

### Required Directories (All Present)
- ✅ `/app` - Next.js App Router
- ✅ `/components` - React components
- ✅ `/lib` - Utilities
- ✅ `/public` - Static assets
- ✅ `/types` - TypeScript types

---

## 🔍 Troubleshooting by Error Type

### Error During Upload

**If upload fails:**
1. **Check file size** - Max upload size limits
2. **Check file format** - Must be `.zip`, `.tar.gz`, or `.tgz`
3. **Try re-zipping** - Use the provided `hostinger-deploy-ready.zip`

**Solution:**
- Use the pre-created zip: `hostinger-deploy-ready.zip` (7.41 MB)
- Or manually zip the `hostinger-deploy` folder

---

### Error After Upload (App Won't Start)

**Most Common Issues:**

#### 1. Node.js App Not Configured
**Symptom:** Upload succeeds but app doesn't run

**Solution:**
1. Go to: **hPanel → Advanced → Node.js**
2. Click: **"Create Node.js App"**
3. Configure:
   - **App Root Directory**: `public_html` (or extraction location)
   - **App Startup File**: `server.js` ⚠️ **CRITICAL - Must match package.json "main"**
   - **Node.js Version**: `20.x`
   - **App Mode**: `Production`
4. Click: **"Start"** button

#### 2. Entry File Mismatch
**Symptom:** "Cannot find module" or "Entry file not found"

**Check:**
- `package.json` has `"main": "server.js"`
- `server.js` exists in root directory
- File names match exactly (case-sensitive)

**Solution:**
- Verify `server.js` is in the same directory as `package.json`
- Check that `package.json` "main" field matches exactly

#### 3. Missing Dependencies
**Symptom:** "Cannot find module 'next'" or similar

**Solution:**
1. SSH into server (if available)
2. Navigate to app directory
3. Run: `npm install`
4. Or: Hostinger should auto-install, but verify in logs

#### 4. Build Not Completed
**Symptom:** App starts but shows errors

**Solution:**
1. Run: `npm run build`
2. Wait for build to complete
3. Then start the app

#### 5. Port/Environment Issues
**Symptom:** App starts but can't connect

**Solution:**
- Check Node.js app port in hPanel
- Verify environment variables are set
- Check app logs in hPanel

---

## 📋 Step-by-Step Deployment

### Method 1: Hostinger File Manager (Recommended)

1. **Upload:**
   - Go to: **hPanel → Files → File Manager**
   - Navigate to `public_html` (or your app directory)
   - Upload: `hostinger-deploy-ready.zip`
   - Right-click → **Extract**

2. **Verify Extraction:**
   - Check that `server.js` is in root
   - Check that `package.json` is in root
   - Verify all folders extracted

3. **Configure Node.js App:**
   - Go to: **hPanel → Advanced → Node.js**
   - Create new app
   - **Startup File**: `server.js`
   - **Node Version**: `20.x`

4. **Set Environment Variables:**
   - Already configured in Hostinger panel
   - Verify all are present

5. **Start App:**
   - Click **"Start"** in Node.js panel
   - Check status shows "Running"

### Method 2: FTP Upload

1. **Extract locally:**
   - Extract `hostinger-deploy-ready.zip` on your computer

2. **Upload via FTP:**
   - Connect via FTP client
   - Upload entire `hostinger-deploy` folder contents
   - Preserve folder structure

3. **Follow steps 3-5** from Method 1

---

## ✅ Pre-Deployment Checklist

Before uploading, verify:

- [x] `package.json` has `"main": "server.js"`
- [x] `package.json` has `"start": "node server.js"`
- [x] `server.js` exists in root directory
- [x] `package-lock.json` included
- [x] All source files included (not just node_modules)
- [x] `/public` folder present
- [x] No `.env` files (use Hostinger env vars)
- [x] Zip file created successfully

---

## 🚨 If Still Having Issues

### Share This Information:

1. **Upload Method:** File Manager / FTP / Other?
2. **Error Timing:** During upload / After upload / When starting app?
3. **Exact Error Message:** Copy the full error text
4. **File List:** Verify these files exist after extraction:
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `/app` folder
   - `/public` folder

### Quick Verification Commands (if SSH available):

```bash
# Check files exist
ls -la server.js package.json

# Check package.json main field
grep '"main"' package.json

# Check start script
grep '"start"' package.json

# Verify Node.js version
node --version

# Install dependencies
npm install

# Build
npm run build
```

---

## 📦 Your Package Status

**File:** `hostinger-deploy-ready.zip`  
**Size:** 7.41 MB  
**Status:** ✅ All requirements met  
**Critical Files:** ✅ All present  
**Structure:** ✅ Correct  

**Ready for upload!** 🚀


