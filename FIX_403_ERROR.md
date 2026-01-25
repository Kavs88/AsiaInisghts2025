# Fix 403 Forbidden Error on Hostinger

## Common Causes of 403 Error

1. **Node.js app not started**
2. **Incorrect file permissions**
3. **Missing or incorrect .htaccess configuration**
4. **Node.js app not configured in hPanel**

## ✅ Solution Steps

### Step 1: Check File Permissions

Via SSH:
```bash
cd public_html
chmod 755 .
chmod 644 *.js *.json *.ts *.tsx
chmod 755 app components lib public
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
```

### Step 2: Configure Node.js App in hPanel

1. **Go to hPanel → Advanced → Node.js**
2. **Create/Update Node.js App:**
   - **App Root Directory**: `public_html`
   - **App Startup File**: `package.json`
   - **Node.js Version**: 18.x or higher
   - **App Mode**: Production
   - **Port**: (Hostinger will assign one)
3. **Click "Create" or "Update"**

### Step 3: Install Dependencies and Build

Via SSH:
```bash
cd public_html
npm install --production
npm run build
```

### Step 4: Start the Application

Via SSH:
```bash
npm start
```

Or use PM2 (recommended):
```bash
npm install -g pm2
pm2 start npm --name "asia-insights" -- start
pm2 save
```

### Step 5: Update .htaccess for Node.js

The .htaccess needs to proxy requests to Node.js. Update it:

```apache
# Next.js on Hostinger - Proxy to Node.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Proxy all requests to Node.js (except static files)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://localhost:PORT/$1 [P,L]
  
  # Replace PORT with the port assigned by Hostinger
  # You can find it in hPanel → Node.js → Your App
</IfModule>
```

**OR** if Hostinger uses a different setup, try:

```apache
# Next.js on Hostinger
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Don't rewrite files that exist
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite to index.html for Next.js
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

### Step 6: Check Node.js App Status

In hPanel → Node.js:
- Make sure the app is **Running**
- Check the **Port** number
- Check for any error messages

### Step 7: Verify Environment Variables

Make sure `.env.local` exists in `public_html/`:

```bash
cd public_html
ls -la .env.local
```

If it doesn't exist, create it:
```bash
cp env.template .env.local
nano .env.local
# Add your Supabase credentials
```

## Alternative: Check if It's a Static File Issue

If only certain files give 403:

```bash
cd public_html
chmod -R 755 public
chmod -R 644 public/*
```

## Still Getting 403?

1. **Check Hostinger Error Logs:**
   - hPanel → Advanced → Error Log
   - Look for specific error messages

2. **Check Node.js Logs:**
   - hPanel → Node.js → Your App → Logs
   - Look for startup errors

3. **Verify Build Completed:**
   ```bash
   cd public_html
   ls -la .next
   ```
   If `.next` folder doesn't exist, run `npm run build`

4. **Check if Port is Correct:**
   - In hPanel Node.js settings, note the assigned port
   - Update .htaccess with the correct port number

## Quick Test

Try accessing:
- `https://plum-dogfish-418157.hostingersite.com` (should work)
- `https://plum-dogfish-418157.hostingersite.com/api/test` (if you have a test route)

If the homepage works but other routes don't, it's a routing issue.
If nothing works, it's likely Node.js not running or .htaccess misconfigured.



