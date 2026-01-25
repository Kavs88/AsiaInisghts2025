# Correct ZIP Extraction Method for Hostinger

## ✅ Proper Extraction Steps

The ZIP file is now structured to preserve folder hierarchy. Here's how to extract it correctly:

### Step 1: Upload ZIP to public_html

1. Upload `hostinger-deploy.zip` to your `public_html/` folder in Hostinger File Manager

### Step 2: Extract the ZIP

1. **Right-click** `hostinger-deploy.zip`
2. **Select "Extract"** or "Extract Here"
3. This will create a `hostinger-deploy/` folder with all your files inside

### Step 3: Move Files to public_html Root

After extraction, you'll have:
```
public_html/
├── hostinger-deploy/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── ...
└── hostinger-deploy.zip
```

**You need to move everything from `hostinger-deploy/` up to `public_html/`:**

1. **Go into** the `hostinger-deploy/` folder
2. **Select ALL files and folders** (Ctrl+A or Cmd+A)
3. **Cut** them (Ctrl+X)
4. **Go back** to `public_html/` (parent folder)
5. **Paste** them (Ctrl+V)
6. **Delete** the now-empty `hostinger-deploy/` folder
7. **Delete** the `hostinger-deploy.zip` file

### Final Structure Should Be:

```
public_html/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── next.config.js
├── .htaccess
└── ... (all other files directly here)
```

## Alternative: Extract via SSH (Easier)

If File Manager is causing issues, use SSH:

```bash
cd public_html
unzip hostinger-deploy.zip
mv hostinger-deploy/* .
mv hostinger-deploy/.* . 2>/dev/null || true
rmdir hostinger-deploy
rm hostinger-deploy.zip
```

This will:
1. Extract the ZIP (creates `hostinger-deploy/` folder)
2. Move all files from `hostinger-deploy/` to `public_html/`
3. Move hidden files (like `.htaccess`)
4. Remove the empty `hostinger-deploy/` folder
5. Remove the ZIP file

## Verification

After moving files, verify the structure:

```bash
cd public_html
ls -la
```

You should see:
- `app/` folder
- `components/` folder  
- `lib/` folder
- `package.json` file
- `next.config.js` file
- `.htaccess` file

If you see a `hostinger-deploy/` folder, you still need to move the contents.



