# Hostinger Deployment - Correct Method (Based on Support Feedback)

## ⚠️ Critical Information

**Hostinger does NOT automatically run the build script.** You must either:
1. **Build locally** and upload the `.next` folder (RECOMMENDED)
2. **Use `heroku-postbuild`** script for automated builds (less reliable)

---

## 🚀 Recommended Method: Build Locally

### Step 1: Build the Application

**Run this in your terminal:**

```powershell
cd hostinger-deploy
npm install
npm run build
```

**Or use the provided script:**
```powershell
.\build-for-hostinger.ps1
```

This creates the `.next` folder which is **required** for the app to run.

### Step 2: Create Zip with .next Folder

**Important:** Include the `.next` folder in your zip!

```powershell
# From project root
cd hostinger-deploy
Compress-Archive -Path * -DestinationPath "..\hostinger-deploy-ready.zip" -Force
```

**Verify `.next` folder is included:**
- Check zip contents
- `.next` folder should be visible

### Step 3: Upload to Hostinger

1. **Upload** `hostinger-deploy-ready.zip` via File Manager or FTP
2. **Extract** in `public_html` or designated directory
3. **Verify** `.next` folder exists after extraction

### Step 4: Configure Node.js App

**Go to:** hPanel → Advanced → Node.js

**Create Node.js App with these EXACT settings:**

- **App Root Directory**: `public_html` (or where files are extracted)
- **App Startup File**: `node_modules/next/dist/bin/next` ⚠️ **EXACT PATH**
- **Start-up Arguments**: `start` ⚠️ **REQUIRED**
- **Node.js Version**: `20.x` (or 18.x)
- **App Mode**: `Production`

**Click "Create" or "Save"**

### Step 5: Start the App

1. Find your app in the Node.js list
2. Click **"Start"** button
3. Status should show **"Running"** ✅

### Step 6: Set Environment Variables

Verify these are set in Hostinger:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`

---

## 🔄 Alternative Method: Automated Build

If you prefer automated builds (less reliable):

1. **Upload WITHOUT `.next` folder**
2. **Hostinger will run `heroku-postbuild` script** (added to package.json)
3. **Configure Node.js app** (same as Step 4 above)

**Note:** Manual build is more reliable and recommended.

---

## ✅ Key Configuration Details

### Startup File (CRITICAL)
```
node_modules/next/dist/bin/next
```

**NOT:**
- ❌ `server.js`
- ❌ `package.json`
- ❌ `next start`

### Start-up Arguments (REQUIRED)
```
start
```

### Node.js Version
- ✅ 20.x (recommended)
- ✅ 18.x (also supported)

---

## 🔍 Verification Checklist

After deployment, verify:

- [ ] `.next` folder exists in root directory
- [ ] `package.json` exists
- [ ] `node_modules/next/dist/bin/next` file exists
- [ ] Node.js app configured with correct startup file
- [ ] Start-up arguments set to `start`
- [ ] App status shows "Running"
- [ ] Environment variables set
- [ ] Site accessible in browser

---

## 🆘 Troubleshooting

### "Missing .next folder"
**Solution:** Build locally first (`npm run build`) and include `.next` in upload

### "Wrong startup file"
**Solution:** Use exact path: `node_modules/next/dist/bin/next`

### "App won't start"
**Check:**
- `.next` folder exists
- Startup file path is correct
- Arguments set to `start`
- Check logs in hPanel → Node.js → View Logs

### "Build failed on server"
**Solution:** Build locally and upload `.next` folder (more reliable)

---

## 📝 Summary

**What Changed:**
- ✅ Added `heroku-postbuild` script to package.json
- ✅ Updated to use `node_modules/next/dist/bin/next` as startup file
- ✅ Updated to use "Advanced → Node.js" method (not auto-detection)
- ✅ Build locally first (most reliable)

**Package:** `hostinger-deploy-ready.zip` (build locally first, include `.next`)

---

**Follow these steps for successful deployment!**


