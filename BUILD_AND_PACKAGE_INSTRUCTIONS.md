# Build and Package Instructions for Hostinger

## Step 1: Build the Application Locally

Before uploading to Hostinger, you MUST build the app locally:

```bash
cd hostinger-deploy
npm install
npm run build
```

This will:
- Install all dependencies
- Build the Next.js application
- Create the `.next` folder (required for production)

**Time:** ~2-5 minutes depending on your system

---

## Step 2: Verify Build Success

After building, verify:

```bash
# Check .next folder exists
ls .next

# Should see:
# - .next/
#   - server/
#   - static/
#   - BUILD_ID
#   - etc.
```

---

## Step 3: Create Deployment Package

### Option A: Include .next Folder (Recommended)

1. **Create zip including .next:**
   ```bash
   cd hostinger-deploy
   # Create zip with everything including .next
   zip -r ../hostinger-deploy-ready.zip . -x "node_modules/*" ".git/*"
   ```

2. **Or use File Manager:**
   - Select all files in `hostinger-deploy` folder
   - Include `.next` folder
   - Create zip

### Option B: Exclude .next (Use heroku-postbuild)

1. **Create zip WITHOUT .next:**
   - Exclude `.next` folder
   - Hostinger will build using `heroku-postbuild` script

2. **Less reliable** - manual build is recommended

---

## Step 4: Upload to Hostinger

1. **Upload the zip file** via File Manager or FTP
2. **Extract** in `public_html` or designated directory
3. **Verify** `.next` folder exists after extraction

---

## Step 5: Configure Node.js App

1. **Go to:** hPanel → Advanced → Node.js
2. **Create Node.js App:**
   - **App Root Directory**: `public_html` (or extraction location)
   - **App Startup File**: `node_modules/next/dist/bin/next`
   - **Start-up Arguments**: `start`
   - **Node.js Version**: 20.x (or 18.x)
   - **App Mode**: Production
3. **Start** the app

---

## Quick Build Script

Save this as `build-for-hostinger.ps1`:

```powershell
cd hostinger-deploy
npm install
npm run build
Write-Output "✅ Build complete! .next folder created."
Write-Output "Now create zip including .next folder"
```

---

## Verification

After upload, verify:
- ✅ `.next` folder exists in root
- ✅ `package.json` exists
- ✅ `node_modules/next/dist/bin/next` exists
- ✅ All environment variables set
- ✅ Node.js app configured correctly

---

**Build locally first for most reliable deployment!**


