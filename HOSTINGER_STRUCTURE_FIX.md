# Hostinger "Unsupported Framework" Error - Fix

## Problem
Hostinger shows: **"Unsupported framework or invalid project structure"**

This happens when Hostinger can't detect Next.js because:
1. Files are in a subdirectory instead of the root
2. Missing required Next.js files at root
3. Wrong extraction location

## ✅ Solution: Extract Files to Root

### Step 1: Upload and Extract
1. Upload `hostinger-deploy-ready.zip` to Hostinger
2. **Extract to `public_html` root** (NOT in a subdirectory)
3. After extraction, `package.json` should be at: `public_html/package.json`

### Step 2: Verify Structure
After extraction, your structure should be:
```
public_html/
├── package.json          ← Must be here
├── next.config.js        ← Must be here
├── app/                  ← Must be here
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── .next/                ← Must be here (built output)
├── components/
├── lib/
└── public/
```

**NOT:**
```
public_html/
└── hostinger-deploy/     ← WRONG - don't extract into subfolder
    ├── package.json
    └── ...
```

### Step 3: Configure Node.js App

**If using "Node.js Web Apps" (Auto-detection):**
- Root Directory: `./` (current directory)
- Should auto-detect Next.js

**If using "Advanced → Node.js" (Manual):**
- App Root Directory: `public_html` (or where files are)
- App Startup File: `node_modules/next/dist/bin/next`
- Start-up Arguments: `start`
- Node.js Version: 20.x
- App Mode: Production

## 🔍 Quick Check

After extraction, verify:
1. ✅ `package.json` is at root (not in subdirectory)
2. ✅ `app/layout.tsx` exists
3. ✅ `app/page.tsx` exists
4. ✅ `.next` folder exists
5. ✅ `next.config.js` exists

## 🚨 Common Mistakes

1. **Extracting into subdirectory:**
   - ❌ `public_html/hostinger-deploy/package.json`
   - ✅ `public_html/package.json`

2. **Wrong root directory in Hostinger:**
   - ❌ Root Directory: `./hostinger-deploy`
   - ✅ Root Directory: `./`

3. **Missing .next folder:**
   - Make sure you built locally and included `.next` in zip

## 📝 Alternative: Recreate Zip with Root Files

If extraction is causing issues, we can create a zip where files are already at root level (no hostinger-deploy folder).

---

**Most likely issue: Files extracted into subdirectory. Extract directly to public_html root!**


