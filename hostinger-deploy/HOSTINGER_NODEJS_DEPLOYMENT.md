# Complete Hostinger Node.js Deployment Guide

## ⚠️ Important: Next.js Requires Node.js Deployment

Simply uploading files to `public_html/` is **NOT enough**. You must configure and start the Node.js application.

## ✅ Complete Deployment Steps

### Step 1: Upload Files (Already Done)

Your files are in `public_html/` with correct structure:
- ✅ `app/` folder
- ✅ `components/` folder
- ✅ `lib/` folder
- ✅ `package.json` file
- ✅ `next.config.js` file

### Step 2: Configure Node.js App in hPanel

**CRITICAL STEP - This is what makes your site work!**

1. **Go to hPanel → Advanced → Node.js**
2. **Click "Create Node.js App"** (or "Add Application")
3. **Configure:**
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json`
   - **Node.js Version**: 18.x or 20.x (choose latest available)
   - **App Mode**: Production
   - **Port**: (Hostinger will assign automatically - note this number!)
4. **Click "Create" or "Save"**

### Step 3: Install Dependencies (Via SSH)

**Open SSH/Terminal in hPanel:**

```bash
cd public_html
npm install --production
```

This installs all dependencies from `package.json`.

### Step 4: Build the Application (Via SSH)

```bash
cd public_html
npm run build
```

This creates the `.next/` folder with optimized production files.

**Wait for build to complete** - this may take 2-5 minutes.

### Step 5: Create Environment File (Via SSH)

```bash
cd public_html
cp env.template .env.local
nano .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://plum-dogfish-418157.hostingersite.com
```

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Start the Node.js App

**Option A: Via hPanel (Easiest)**
1. Go to **hPanel → Node.js → Your App**
2. Click **"Start"** button
3. Status should show **"Running"**

**Option B: Via SSH**
```bash
cd public_html
npm start
```

**Option C: Via PM2 (Recommended for Production)**
```bash
cd public_html
npm install -g pm2
pm2 start npm --name "asia-insights" -- start
pm2 save
pm2 startup
```

### Step 7: Update .htaccess (If Needed)

If Hostinger requires port proxying, check the **Port** number in Node.js settings, then update `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Replace YOUR_PORT with the port from Node.js settings
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
</IfModule>
```

**OR** if Hostinger handles routing automatically, your current `.htaccess` should work.

### Step 8: Verify Deployment

1. **Visit**: `https://plum-dogfish-418157.hostingersite.com`
2. **Check Node.js Status**: hPanel → Node.js → Should show "Running"
3. **Check Logs**: hPanel → Node.js → View Logs (for any errors)

## 🔍 Troubleshooting

### "403 Forbidden"
- ✅ Node.js app not started → Start it in hPanel
- ✅ Dependencies not installed → Run `npm install`
- ✅ Build not completed → Run `npm run build`

### "Cannot find module"
```bash
cd public_html
npm install --production
```

### "Build failed"
```bash
cd public_html
npm run build
# Check error messages
```

### "Port already in use"
- Check Node.js settings in hPanel for assigned port
- Make sure only one instance is running

### Site loads but shows errors
- Check browser console (F12)
- Check Node.js logs in hPanel
- Verify `.env.local` has correct Supabase credentials

## 📋 Checklist

- [ ] Files uploaded to `public_html/` ✅ (You have this)
- [ ] Node.js app created in hPanel
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] `.env.local` created with Supabase credentials
- [ ] Node.js app started (Status: "Running")
- [ ] Site accessible at: `https://plum-dogfish-418157.hostingersite.com`

## 🎯 Most Common Issue

**The Node.js app is not started!**

After configuring in hPanel, you **must** click "Start" or run `npm start` via SSH.

## Next Steps After Site Works

1. **Configure Supabase Redirect URLs** (see `SUPABASE_REDIRECT_URLS.md`)
2. **Test all pages and routes**
3. **Verify authentication works**
4. **Check database connections**

