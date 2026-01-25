# Hostinger Deployment - Final Instructions

Based on Hostinger support feedback, here are the correct deployment steps.

## ⚠️ Important: Build Process

**Hostinger does NOT automatically run the build script.** You have two options:

### Option A: Build Locally (Most Reliable) ✅ Recommended

1. **Build your app locally:**
   ```bash
   cd hostinger-deploy
   npm install
   npm run build
   ```
   This creates the `.next` directory.

2. **Upload ALL files including `.next` folder:**
   - Include the `.next` directory in your zip
   - Upload via File Manager or FTP

3. **Configure Node.js App:**
   - Go to: **hPanel → Advanced → Node.js**
   - **App Root Directory**: `public_html` (or where files are)
   - **App Startup File**: `node_modules/next/dist/bin/next`
   - **Start-up Arguments**: `start`
   - **Node.js Version**: 20.x (or 18.x)
   - **App Mode**: Production
   - **Start** the app

### Option B: Automated Build on Server

1. **Upload files WITHOUT `.next` folder:**
   - Upload your source files
   - `.next` will be created during deployment

2. **Hostinger will run `heroku-postbuild` script:**
   - This runs `npm run build` automatically
   - Creates `.next` directory on server

3. **Configure Node.js App** (same as Option A)

---

## 📦 Updated Package Configuration

### package.json Scripts

```json
{
  "scripts": {
    "start": "next start",
    "build": "next build",
    "heroku-postbuild": "next build",  ✅ Added for automated builds
    "dev": "next dev -p 3001",
    "lint": "next lint"
  }
}
```

### Node.js App Configuration

**In hPanel → Advanced → Node.js:**

- **App Root Directory**: `public_html` (or extraction location)
- **App Startup File**: `node_modules/next/dist/bin/next`
- **Start-up Arguments**: `start`
- **Node.js Version**: 20.x (or 18.x)
- **App Mode**: Production

---

## 🚀 Recommended Deployment Steps

### Step 1: Build Locally (Recommended)

```bash
cd hostinger-deploy
npm install
npm run build
```

This creates the `.next` folder.

### Step 2: Create Zip with .next Folder

Include the `.next` folder in your zip file:
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `.next/` folder (built output)
- ✅ All source files
- ✅ `node_modules/` (optional, will reinstall on server)

### Step 3: Upload to Hostinger

1. **Upload zip file** via File Manager or FTP
2. **Extract** the files
3. **Verify** `.next` folder exists

### Step 4: Configure Node.js App

1. Go to: **hPanel → Advanced → Node.js**
2. Click: **"Create Node.js App"**
3. Configure:
   - **App Root Directory**: `public_html` (or extraction location)
   - **App Startup File**: `node_modules/next/dist/bin/next`
   - **Start-up Arguments**: `start`
   - **Node.js Version**: 20.x
   - **App Mode**: Production
4. **Save** and **Start** the app

### Step 5: Set Environment Variables

Verify these are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL`

---

## 🔍 Common Issues & Solutions

### Issue: "Missing .next folder"
**Solution**: Build locally first (`npm run build`) and include `.next` in upload

### Issue: "Wrong startup file"
**Solution**: Use `node_modules/next/dist/bin/next` (not `server.js`)

### Issue: "App won't start"
**Solution**: 
- Verify `.next` folder exists
- Check startup file path is correct
- Verify Node.js version (20.x or 18.x)
- Check app logs in hPanel

### Issue: "Not uploading all dependencies"
**Solution**: 
- Include `package-lock.json`
- Hostinger will run `npm install` automatically
- Or include `node_modules/` in upload (larger file)

---

## ✅ Checklist

- [ ] Built app locally (`npm run build`)
- [ ] `.next` folder created
- [ ] Zip includes `.next` folder
- [ ] Uploaded to Hostinger
- [ ] Files extracted correctly
- [ ] Node.js app configured:
  - [ ] Startup File: `node_modules/next/dist/bin/next`
  - [ ] Arguments: `start`
  - [ ] Node Version: 20.x
- [ ] Environment variables set
- [ ] App started in hPanel
- [ ] Site accessible

---

## 📝 Key Differences from Previous Instructions

**Old Instructions:**
- Used `server.js` as startup file
- Relied on auto-build
- Used "Node.js Web Apps" method

**New Instructions (Based on Support):**
- Use `node_modules/next/dist/bin/next` as startup file
- Build locally first (most reliable)
- Use "Advanced → Node.js" method
- Include `.next` folder in upload

---

**Follow these steps for successful deployment!**


