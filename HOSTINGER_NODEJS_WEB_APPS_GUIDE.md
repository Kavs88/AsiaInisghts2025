# Hostinger Node.js Web Apps - Complete Guide

## Overview

This guide covers deploying your Next.js application using Hostinger's **Node.js Web Apps** feature, which provides automatic framework detection and simplified deployment.

**Reference:** [Hostinger Node.js Deployment Documentation](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/#Managing-Front-End-Application)

---

## What is Node.js Web Apps?

Hostinger's Node.js Web Apps feature:
- **Auto-detects** your framework (Next.js, React, Vue, etc.)
- **Auto-configures** build settings
- **Automatically** builds and deploys your app
- **Simplifies** the entire deployment process

**Supported Frameworks:**
- Frontend: React, Vue.js, Angular, Vite, Parcel, Preact, **Next.js**
- Backend: **Next.js**, Express.js

**Supported Node.js Versions:** 18.x, 20.x, 22.x, 24.x

---

## Prerequisites

- ✅ Business Web Hosting plan or Cloud hosting plan
- ✅ Next.js application (this project)
- ✅ Compressed project files (`.zip`)

---

## Package Requirements

### ✅ Your Package is Ready

Your `hostinger-deploy-ready.zip` includes:

- ✅ Standard Next.js App Router structure (`/app`, `/public`, etc.)
- ✅ `package.json` with `"build"` and `"start"` scripts
- ✅ `next.config.js` configuration
- ✅ All source files and dependencies
- ✅ No `server.js` (not needed for auto-detection)
- ✅ No `"main"` field (not needed for auto-detection)

### Package.json Requirements Met:
```json
{
  "scripts": {
    "build": "next build",  ✅ Required
    "start": "next start"   ✅ Required
  },
  "engines": {
    "node": ">=18.17.0"      ✅ Node version declared
  }
}
```

---

## Deployment Process

### Method 1: File Upload (Recommended for This Project)

1. **Access Node.js Web Apps**
   - hPanel → Websites → Add Website → Node.js Apps

2. **Upload Files**
   - Select "Upload your website files"
   - Upload `hostinger-deploy-ready.zip`

3. **Auto-Detection**
   - Hostinger detects Next.js automatically
   - Suggests build settings (verify they're correct)

4. **Configure Environment Variables**
   - Add all required env vars in settings

5. **Deploy**
   - Click "Deploy"
   - Hostinger handles the rest automatically

### Method 2: GitHub Integration (Alternative)

1. **Access Node.js Web Apps**
   - Same as above

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Authorize GitHub access
   - Select your repository

3. **Auto-Detection & Deploy**
   - Same auto-detection process
   - Automatic deployment on git push

---

## Environment Variables

### Required Variables

Add these in Hostinger's deployment settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hkssuvamxdnqptyprsom.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk` |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_PNblE5m4cWt7_AqvxK6dKw_ewS8K_L_` |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | Your domain URL |

---

## Build Settings (Auto-Detected)

Hostinger will auto-detect these settings. **Just verify:**

- **Framework Preset**: Next.js ✅
- **Node Version**: 20.x (or 18.x, 22.x, 24.x)
- **Root Directory**: `./`
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Package Manager**: `npm` ✅

**These should be correct - no changes needed!**

---

## Post-Deployment

### Managing Your Deployment

1. **View Deployment Details**
   - Click "See details" in website dashboard
   - View build logs and status

2. **Redeploy**
   - Upload new files to redeploy
   - Or push to GitHub (if using GitHub integration)

3. **Connect Custom Domain**
   - After deployment, connect your domain
   - Follow: [How to Connect a Preferred Domain](https://www.hostinger.com/support/how-to-connect-a-preferred-domain-name-instead-of-a-temporary-one-at-hostinger)

### Monitoring

- Check deployment status in dashboard
- View build logs for errors
- Monitor app performance

---

## Troubleshooting

### Build Fails
- Check build logs in "See details"
- Verify Node.js version compatibility
- Check for TypeScript errors
- Verify all dependencies in package.json

### Deployment Fails
- Check deployment logs
- Verify environment variables
- Ensure package.json scripts are correct
- Verify file structure is standard Next.js

### Site Errors
- Check browser console (F12)
- Verify environment variables are set
- Check deployment logs
- Verify Supabase connection

---

## Key Advantages of This Method

✅ **Simpler**: No manual Node.js app configuration  
✅ **Automatic**: Framework auto-detection  
✅ **Reliable**: Standard Next.js deployment  
✅ **Managed**: Hostinger handles build and deploy  
✅ **Tracked**: All deployments logged in dashboard  

---

## Comparison: Old vs New Method

| Feature | Old Method (Advanced → Node.js) | New Method (Node.js Web Apps) |
|---------|----------------------------------|-------------------------------|
| Setup | Manual Node.js app creation | Auto-detection |
| Entry File | Requires `server.js` | Not needed |
| package.json | Needs `"main"` field | Not needed |
| Build | Manual configuration | Auto-configured |
| Deploy | Manual start/stop | Automatic |

---

## Your Package Status

✅ **Ready for Node.js Web Apps deployment**

- Package: `hostinger-deploy-ready.zip`
- Method: File Upload → Auto-Detection
- Framework: Next.js (will be auto-detected)
- Status: All requirements met

**Proceed with deployment using the steps in `HOSTINGER_STEP_BY_STEP_SETUP.md`**

---

**Reference:** [Hostinger Node.js Deployment Guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/#Managing-Front-End-Application)


