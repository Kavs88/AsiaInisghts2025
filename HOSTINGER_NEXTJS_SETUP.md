# Hostinger Next.js Setup Guide

## ✅ What I Fixed

1. **Created `server.js`** - Hostinger needs a server entry point for Next.js backend applications
2. **Updated `package.json`** - Changed `start` script to use `node server.js`
3. **Disabled standalone output** - Compatible with Hostinger's build system

## 📋 Hostinger Configuration

### In Hostinger Panel:

1. **Framework Preset**: Next.js ✅
2. **Node Version**: 20.x ✅
3. **Root Directory**: `./` ✅
4. **Build Command**: `npm run build` ✅
5. **Output Directory**: `.next` ✅
6. **Start Command**: `npm start` (uses `node server.js`) ✅

### Important: Node.js App Setup

After uploading, you **MUST** also:

1. **Go to**: hPanel → Advanced → Node.js
2. **Create Node.js App**:
   - **App Root Directory**: `public_html` (or where files are extracted)
   - **App Startup File**: `server.js` ⚠️ **This is critical!**
   - **Node.js Version**: 20.x
   - **App Mode**: Production
   - **Port**: (Auto-assigned - write this down!)

3. **Start the App** - Click "Start" button

## 🔧 Files Added/Modified

- ✅ `server.js` - Server entry point for Hostinger
- ✅ `package.json` - Updated start script
- ✅ `next.config.js` - Standalone output disabled

## 🚀 Upload Steps

1. Upload `hostinger-deploy-ready.zip` to Hostinger
2. Wait for extraction
3. **Configure Node.js App** in hPanel (see above)
4. Set environment variables (already done)
5. Start the Node.js app
6. Test your site!

## ⚠️ Common Issues

### "App not compatible"
- Make sure you created the **Node.js App** in hPanel
- Set **Startup File** to `server.js`
- Verify Node.js version is 20.x

### "Cannot find module"
- Make sure `npm install` ran during build
- Check that all dependencies are in `package.json`

### "Port already in use"
- Check Node.js app settings for assigned port
- Restart the app in hPanel

---

**The new zip file is ready with `server.js` included!** 🎉


