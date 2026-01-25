# Quick Fix for 403 Forbidden Error

## Most Likely Cause: Node.js App Not Running

The 403 error usually means the Node.js application isn't started or configured.

## ✅ Quick Fix Steps

### 1. Check Node.js App Status

**In Hostinger hPanel:**
1. Go to **Advanced → Node.js**
2. Check if your app is listed
3. Check if it shows **"Running"** status
4. If not running, click **"Start"** or **"Restart"**

### 2. Configure Node.js App (If Not Done)

1. **hPanel → Advanced → Node.js**
2. **Click "Create Node.js App"** or **"Edit"** existing
3. **Set these values:**
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json`
   - **Node.js Version**: 18.x or 20.x
   - **App Mode**: Production
4. **Save/Update**

### 3. Install and Build (Via SSH)

```bash
cd public_html
npm install --production
npm run build
```

### 4. Start the App

**Option A: Via hPanel Node.js**
- Click **"Start"** button in Node.js settings

**Option B: Via SSH**
```bash
cd public_html
npm start
```

**Option C: Via PM2 (Recommended)**
```bash
cd public_html
npm install -g pm2
pm2 start npm --name "asia-insights" -- start
pm2 save
```

### 5. Check the Port

1. In **hPanel → Node.js**, note the **Port** number (e.g., 3000, 3001, 8080)
2. Update `.htaccess` if needed (see below)

### 6. Update .htaccess

If Hostinger requires port proxying, update `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Replace YOUR_PORT with the port from Node.js settings
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:YOUR_PORT/$1 [P,L]
</IfModule>
```

**OR** if Hostinger handles routing automatically, use:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

## Common Issues

### Issue: "Cannot find module"
**Fix:**
```bash
cd public_html
npm install --production
```

### Issue: "Build failed"
**Fix:**
```bash
cd public_html
npm run build
```

### Issue: "Port already in use"
**Fix:** Check Node.js settings in hPanel for the assigned port

### Issue: "Environment variables missing"
**Fix:**
```bash
cd public_html
cp env.template .env.local
# Edit .env.local with your Supabase credentials
```

## Verification

After fixing, test:
1. Visit: `https://plum-dogfish-418157.hostingersite.com`
2. Should see your homepage
3. Check browser console (F12) for any errors

## Still Getting 403?

1. **Check Error Logs:**
   - hPanel → Advanced → Error Log
   - Look for specific error messages

2. **Check Node.js Logs:**
   - hPanel → Node.js → Your App → View Logs

3. **Verify Files Are Uploaded:**
   ```bash
   cd public_html
   ls -la
   ```
   Should see: `app/`, `components/`, `package.json`, etc.

4. **Check Permissions:**
   ```bash
   chmod 755 .
   chmod -R 755 app components lib public
   ```



