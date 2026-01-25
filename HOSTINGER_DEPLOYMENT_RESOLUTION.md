# Hostinger Deployment Resolution Guide

## Current Issues

1. ✅ Files uploaded to `public_html/` with correct structure
2. ❌ Site shows **403 Forbidden** error
3. ❌ Node.js app not configured/started
4. ❌ Dependencies not installed
5. ❌ Application not built

## Root Cause

Next.js requires a **running Node.js process**. Simply uploading files is not enough. The application must be:
- Configured in Hostinger's Node.js panel
- Dependencies installed
- Built for production
- Started and running

## Complete Resolution Steps

### Step 1: Verify File Structure (Already Done ✅)

Your files should be in `public_html/` with this structure:
```
public_html/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── next.config.js
└── .htaccess
```

### Step 2: Configure Node.js App in hPanel

**CRITICAL - This is what makes your site work!**

1. **Login to Hostinger hPanel**
2. **Navigate to:** Advanced → Node.js
3. **Click:** "Create Node.js App" or "Add Application"
4. **Configure:**
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json` (or `server.js` if you create one)
   - **Node.js Version**: 18.x or 20.x (choose latest available)
   - **App Mode**: Production
   - **Port**: (Hostinger will assign automatically - **NOTE THIS NUMBER**)
5. **Click:** "Create" or "Save"

### Step 3: Access SSH/Terminal

**In hPanel:**
1. Go to **Advanced → Terminal** (or SSH)
2. Click **"Open Terminal"** or **"Launch SSH"**

### Step 4: Install Dependencies

**In SSH/Terminal, run:**
```bash
cd public_html
npm install --production
```

**Wait for completion** (2-5 minutes depending on connection speed)

### Step 5: Create Environment File

```bash
cd public_html
cp env.template .env.local
nano .env.local
```

**Add your Supabase credentials:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://hkssuvamxdnqptyprsom.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_onOg2F-nuzyQAS5SkSvOcA_EqC2WVgk
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://plum-dogfish-418157.hostingersite.com
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Build the Application

```bash
cd public_html
npm run build
```

**Wait for build to complete** (3-10 minutes). You should see:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

### Step 7: Start the Node.js App

**Option A: Via hPanel (Recommended)**
1. Go to **hPanel → Advanced → Node.js**
2. Find your app in the list
3. Click **"Start"** button
4. Status should change to **"Running"**

**Option B: Via SSH**
```bash
cd public_html
npm start
```

**Option C: Via PM2 (Best for Production)**
```bash
cd public_html
npm install -g pm2
pm2 start npm --name "asia-insights" -- start
pm2 save
pm2 startup
```

### Step 8: Update .htaccess (If Needed)

**Check the Port Number** assigned in Node.js settings (e.g., 3000, 3001, 8080)

**If Hostinger requires port proxying**, update `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Replace YOUR_PORT with the actual port from Node.js settings
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
</IfModule>
```

**OR** if Hostinger handles routing automatically, your current `.htaccess` should work.

### Step 9: Verify Deployment

1. **Visit:** `https://plum-dogfish-418157.hostingersite.com`
2. **Check Status:** hPanel → Node.js → Should show "Running"
3. **Check Logs:** hPanel → Node.js → View Logs (for any errors)
4. **Browser Console:** Press F12 → Check for errors

## Troubleshooting

### Still Getting 403?

**Check these in order:**

1. **Node.js App Status**
   - hPanel → Node.js → Is it "Running"?
   - If not, click "Start"

2. **Dependencies Installed?**
   ```bash
   cd public_html
   ls -la node_modules
   ```
   Should show many folders

3. **Build Completed?**
   ```bash
   cd public_html
   ls -la .next
   ```
   Should show `.next` folder

4. **Environment Variables Set?**
   ```bash
   cd public_html
   cat .env.local
   ```
   Should show your Supabase credentials

5. **Port Configuration**
   - Check assigned port in Node.js settings
   - Update `.htaccess` if needed

6. **File Permissions**
   ```bash
   cd public_html
   chmod 755 .
   chmod -R 755 app components lib public
   ```

### Error: "Cannot find module"

**Fix:**
```bash
cd public_html
rm -rf node_modules package-lock.json
npm install --production
```

### Error: "Build failed"

**Check build logs:**
```bash
cd public_html
npm run build 2>&1 | tee build.log
```

**Common causes:**
- Missing environment variables
- TypeScript errors
- Missing dependencies

### Error: "Port already in use"

**Fix:**
- Check Node.js settings for assigned port
- Make sure only one instance is running
- Restart the Node.js app in hPanel

### Site loads but shows errors

**Check:**
1. Browser console (F12) for JavaScript errors
2. Node.js logs in hPanel
3. Supabase connection (verify credentials in `.env.local`)
4. Network tab for failed API requests

## Quick Checklist

- [ ] Node.js app created in hPanel
- [ ] App Root Directory set to `public_html`
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] `.env.local` created with Supabase credentials
- [ ] Node.js app started (Status: "Running")
- [ ] Port noted and `.htaccess` updated if needed
- [ ] Site accessible at: `https://plum-dogfish-418157.hostingersite.com`

## Next Steps After Site Works

1. **Configure Supabase Redirect URLs**
   - See `SUPABASE_REDIRECT_URLS.md`
   - Add: `https://plum-dogfish-418157.hostingersite.com/**`

2. **Test All Pages**
   - Homepage
   - Properties/Stays
   - Businesses
   - Markets
   - Authentication

3. **Monitor Performance**
   - Check Node.js logs regularly
   - Monitor Supabase dashboard
   - Check error logs in hPanel

## Support

If issues persist:
1. Check **hPanel → Advanced → Error Log**
2. Check **Node.js → View Logs**
3. Verify all steps above were completed
4. Contact Hostinger support with specific error messages


