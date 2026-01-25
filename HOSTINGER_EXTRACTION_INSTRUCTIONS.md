# Hostinger Extraction Instructions - CRITICAL

## ⚠️ The Problem

Hostinger shows: **"Unsupported framework or invalid project structure"**

This happens because files are extracted into a **subdirectory** instead of the **root**.

## ✅ The Solution

### Option 1: Extract to Root (Recommended)

1. **Upload** `hostinger-deploy-ready.zip` to Hostinger File Manager
2. **Navigate to** `public_html` (or your web root)
3. **Extract the zip** - files should extract directly into `public_html`
4. **Verify structure:**
   ```
   public_html/
   ├── package.json      ← Should be HERE (not in subfolder)
   ├── next.config.js
   ├── app/
   ├── .next/
   └── ...
   ```

5. **If files are in subdirectory:**
   - Move all files from `public_html/hostinger-deploy/*` to `public_html/`
   - Delete the empty `hostinger-deploy` folder

### Option 2: Use Root-Level Zip

I've created `hostinger-deploy-ready-root.zip` where files are already at root level.

1. **Upload** `hostinger-deploy-ready-root.zip`
2. **Extract** to `public_html`
3. Files will be at root automatically

## 🔍 Verification Checklist

After extraction, verify these files exist at root:

- [ ] `public_html/package.json` exists
- [ ] `public_html/next.config.js` exists  
- [ ] `public_html/app/layout.tsx` exists
- [ ] `public_html/app/page.tsx` exists
- [ ] `public_html/.next/` folder exists
- [ ] `public_html/components/` folder exists

## ⚙️ Configure Node.js App

**After files are at root:**

1. Go to: **hPanel → Advanced → Node.js**
2. Create Node.js App:
   - **App Root Directory**: `public_html` (or `./` if already in public_html)
   - **App Startup File**: `node_modules/next/dist/bin/next`
   - **Start-up Arguments**: `start`
   - **Node.js Version**: 20.x
   - **App Mode**: Production
3. **Start** the app

## 🚨 Common Mistakes

❌ **Wrong:**
```
public_html/
└── hostinger-deploy/
    ├── package.json
    └── app/
```

✅ **Correct:**
```
public_html/
├── package.json
└── app/
```

---

**The key is: package.json must be at the web root, not in a subdirectory!**


