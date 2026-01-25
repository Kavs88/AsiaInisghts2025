# Hostinger Framework Detection - Complete Fix

## Root Cause Analysis

Based on Hostinger documentation, the "Unsupported framework" error occurs when:

1. **Oryx build system** (used by Hostinger) cannot detect the framework
2. **Files are not at root level** of the uploaded archive
3. **Missing required files** for Next.js detection
4. **Incorrect package.json structure**

## ✅ Required Files for Next.js Detection

Hostinger's Oryx system detects Next.js by looking for:

1. ✅ `package.json` with `next` in dependencies
2. ✅ `app/` directory (App Router) OR `pages/` directory (Pages Router)
3. ✅ `next.config.js` or `next.config.mjs`
4. ✅ `package-lock.json` (recommended)

## 🔧 Fix Steps

### Step 1: Verify Package Structure

Your `package.json` must have:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### Step 2: Ensure Root-Level Structure

When extracting zip, structure must be:
```
public_html/          ← Root
├── package.json      ← Must be here
├── next.config.js
├── app/              ← Next.js App Router
│   ├── layout.tsx
│   └── page.tsx
├── package-lock.json
└── ...
```

**NOT:**
```
public_html/
└── hostinger-deploy/  ← WRONG
    ├── package.json
    └── app/
```

### Step 3: Use Hostinger's Node.js Web Apps Feature

1. **Go to:** hPanel → Websites → Add Website
2. **Select:** "Node.js Apps"
3. **Upload:** Your zip file
4. **Let Hostinger auto-detect** Next.js
5. **Verify settings:**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Start Command: `npm start`

### Step 4: Alternative - Manual Configuration

If auto-detection fails:

1. **Go to:** hPanel → Advanced → Node.js
2. **Create Node.js App:**
   - **App Root Directory:** `public_html` (or where files are)
   - **App Startup File:** `node_modules/next/dist/bin/next`
   - **Start-up Arguments:** `start`
   - **Node.js Version:** 20.x
   - **App Mode:** Production

## 🚨 Common Issues

### Issue 1: Files in Subdirectory
**Symptom:** "Unsupported framework" error
**Fix:** Extract zip so files are at root, not in subfolder

### Issue 2: Missing package-lock.json
**Symptom:** Detection fails
**Fix:** Include `package-lock.json` in zip

### Issue 3: Wrong Node.js Version
**Symptom:** Build fails
**Fix:** Use Node.js 18.x, 20.x, 22.x, or 24.x

### Issue 4: Missing app/ Directory
**Symptom:** Framework not detected
**Fix:** Ensure `app/` directory exists with `layout.tsx` and `page.tsx`

## 📋 Verification Checklist

Before uploading:
- [ ] `package.json` has `next` in dependencies
- [ ] `app/` directory exists with `layout.tsx` and `page.tsx`
- [ ] `next.config.js` exists
- [ ] `package-lock.json` included
- [ ] Files will extract to root (not subdirectory)

After upload:
- [ ] Files extracted to `public_html/` root
- [ ] `package.json` at `public_html/package.json`
- [ ] `app/` directory at `public_html/app/`
- [ ] Framework auto-detected as Next.js

---

**Key Point: Hostinger uses Oryx which auto-detects frameworks. Ensure files are at root level and all required Next.js files are present.**


