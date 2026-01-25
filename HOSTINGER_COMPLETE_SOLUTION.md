# Hostinger "Unsupported Framework" - Complete Solution

## 🔍 Root Cause

Hostinger uses **Oryx build system** which auto-detects frameworks. The error occurs when:
1. Files are extracted into a **subdirectory** instead of root
2. Oryx cannot find required Next.js files at the expected location
3. Framework detection fails because structure doesn't match expectations

## ✅ Solution: Step-by-Step

### Method 1: Node.js Web Apps (Auto-Detection) - RECOMMENDED

**Step 1: Prepare Zip File**
- ✅ Use `hostinger-deploy-ready.zip` (already created)
- ✅ Files are structured correctly
- ✅ All required files included

**Step 2: Upload to Hostinger**
1. Go to: **hPanel → Websites → Add Website**
2. Select: **"Node.js Apps"** (NOT "Advanced → Node.js")
3. Choose: **"Upload your website files"**
4. Upload: `hostinger-deploy-ready.zip`
5. Wait for upload to complete

**Step 3: Extract Files**
1. **CRITICAL:** Extract zip to `public_html` **ROOT**
2. After extraction, verify structure:
   ```
   public_html/
   ├── package.json      ← Must be HERE
   ├── next.config.js
   ├── app/
   │   ├── layout.tsx
   │   └── page.tsx
   ├── package-lock.json
   └── ...
   ```
3. **If files are in subdirectory:**
   - Move all files from `public_html/hostinger-deploy/*` to `public_html/`
   - Delete empty `hostinger-deploy` folder

**Step 4: Configure Build Settings**
Hostinger should **auto-detect** Next.js. Verify these settings:

- ✅ **Framework Preset:** Next.js (auto-detected)
- ✅ **Node Version:** 20.x (or 18.x, 22.x, 24.x)
- ✅ **Root Directory:** `./`
- ✅ **Build Command:** `npm run build`
- ✅ **Output Directory:** `.next`
- ✅ **Package Manager:** `npm`
- ✅ **Start Command:** `npm start`

**Step 5: Set Environment Variables**
Add these in Hostinger's environment variables section:
```
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://saddlebrown-stinkbug-619379.hostingersite.com
```

**Step 6: Deploy**
1. Click **"Deploy"** or **"Save"**
2. Wait for build to complete
3. Check build logs for any errors

---

### Method 2: Advanced Node.js (Manual Configuration)

If auto-detection fails, use manual configuration:

**Step 1: Extract Files** (same as Method 1, Step 3)

**Step 2: Configure Node.js App**
1. Go to: **hPanel → Advanced → Node.js**
2. Click: **"Create Node.js App"**
3. Configure:
   - **App Root Directory:** `public_html` (or `./` if in public_html)
   - **App Startup File:** `node_modules/next/dist/bin/next`
   - **Start-up Arguments:** `start`
   - **Node.js Version:** 20.x
   - **App Mode:** Production
4. **Start** the app

**Step 3: Build on Server**
Since you've already built locally, the `.next` folder should exist. If not:
1. SSH into server (if available)
2. Run: `npm install && npm run build`
3. Restart Node.js app

---

## 🚨 Critical Requirements

### File Structure (After Extraction)
```
public_html/              ← Root directory
├── package.json         ← REQUIRED: Must be at root
├── next.config.js       ← REQUIRED: Next.js config
├── package-lock.json    ← REQUIRED: For dependency resolution
├── app/                  ← REQUIRED: App Router directory
│   ├── layout.tsx       ← REQUIRED: Root layout
│   └── page.tsx         ← REQUIRED: Home page
├── .next/                ← REQUIRED: Build output (if pre-built)
├── components/
├── lib/
└── public/
```

### package.json Requirements
```json
{
  "dependencies": {
    "next": "^14.0.0",      ← REQUIRED: For detection
    "react": "^18.3.1",     ← REQUIRED: For detection
    "react-dom": "^18.3.1"  ← REQUIRED: For detection
  },
  "scripts": {
    "build": "next build",   ← REQUIRED: Build script
    "start": "next start"    ← REQUIRED: Start script
  }
}
```

---

## 🔧 Troubleshooting

### Issue: "Unsupported framework" persists

**Check 1: File Location**
```bash
# Verify package.json is at root
ls public_html/package.json
# Should exist, NOT: public_html/hostinger-deploy/package.json
```

**Check 2: Required Files**
```bash
# Verify all required files exist
ls public_html/app/layout.tsx
ls public_html/app/page.tsx
ls public_html/next.config.js
ls public_html/package-lock.json
```

**Check 3: Hosting Plan**
- ✅ Must be: Business Web Hosting, Cloud Startup, Cloud Professional, Cloud Enterprise, or Cloud Enterprise Plus
- ❌ NOT supported on: Shared hosting plans

**Check 4: Node.js Version**
- ✅ Supported: 18.x, 20.x, 22.x, 24.x
- ❌ NOT supported: Other versions

**Check 5: Build Logs**
1. Go to: hPanel → Node.js Web Apps → Your App → Logs
2. Check for specific error messages
3. Look for framework detection messages

---

## 📋 Pre-Upload Checklist

Before uploading zip:
- [ ] `package.json` has `next` in dependencies
- [ ] `app/` directory exists with `layout.tsx` and `page.tsx`
- [ ] `next.config.js` exists
- [ ] `package-lock.json` included
- [ ] `.next` folder included (if pre-built)
- [ ] Zip file structure: files at root level (not in subdirectory)

After extraction:
- [ ] `package.json` at `public_html/package.json` (not in subfolder)
- [ ] `app/` directory at `public_html/app/`
- [ ] All files extracted to root
- [ ] No nested subdirectories

---

## 🎯 Quick Fix Summary

**The #1 issue is file location after extraction.**

1. **Extract zip to `public_html` ROOT** (not in subdirectory)
2. **Verify** `package.json` is at `public_html/package.json`
3. **Use Node.js Web Apps** feature for auto-detection
4. **Let Hostinger build** (or include `.next` if pre-built)

---

## 📞 If Still Failing

1. **Check build logs** in hPanel
2. **Verify hosting plan** supports Node.js
3. **Contact Hostinger support** with:
   - Exact error message
   - Build logs
   - Your hosting plan type
   - File structure screenshot

---

**Key Point: Files MUST be at root level after extraction for Oryx to detect Next.js framework!**


