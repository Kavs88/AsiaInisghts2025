# Quick Setup Checklist - Copy This!

Use this checklist as you go through the setup:

## ✅ Pre-Upload
- [x] Zip file ready: `hostinger-deploy-ready.zip`
- [x] All files verified
- [x] package.json correct

## 📤 Upload
- [ ] Logged into Hostinger hPanel
- [ ] Navigated to File Manager
- [ ] Uploaded `hostinger-deploy-ready.zip`
- [ ] Extracted the zip file
- [ ] Verified `server.js` exists
- [ ] Verified `package.json` exists

## ⚙️ Node.js Configuration
- [ ] Went to: Advanced → Node.js
- [ ] Clicked "Create Node.js App"
- [ ] Set App Root Directory: `public_html`
- [ ] Set App Startup File: `server.js` ⚠️
- [ ] Set Node.js Version: `20.x`
- [ ] Set App Mode: `Production`
- [ ] Clicked "Create/Save"
- [ ] Clicked "Start" button
- [ ] Status shows "Running" ✅

## 🔧 Environment Variables
- [ ] Verified all env vars are set in Hostinger
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ✅
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ✅
- [ ] `NODE_ENV=production` ✅
- [ ] `NEXT_PUBLIC_APP_URL` ✅

## 🧪 Testing
- [ ] Visited your domain
- [ ] Site loads without errors
- [ ] Checked browser console (F12) - no errors
- [ ] Tested a page navigation

---

**If any step fails, note which step and the error message!**


