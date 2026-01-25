# ZIP Extraction Solution

## The Problem

When extracting, files are appearing at individual file level instead of preserving folder structure (app/, components/, lib/, etc.).

## ✅ Solution: Use SSH to Extract

The easiest and most reliable method is to extract via SSH, which preserves folder structure:

### Step 1: Upload ZIP via File Manager
- Upload `hostinger-deploy.zip` to `public_html/` folder

### Step 2: Extract via SSH/Terminal

1. **Open SSH/Terminal** in Hostinger hPanel
2. **Navigate to public_html:**
   ```bash
   cd public_html
   ```

3. **Extract the ZIP:**
   ```bash
   unzip hostinger-deploy.zip
   ```

4. **Remove the ZIP file:**
   ```bash
   rm hostinger-deploy.zip
   ```

### Step 3: Verify Structure

```bash
ls -la
```

You should see folders:
- `app/`
- `components/`
- `lib/`
- `public/`
- `package.json`
- `next.config.js`
- etc.

## Why This Works

SSH `unzip` command preserves the folder structure that's inside the ZIP file, whereas some File Manager extraction tools may flatten the structure.

## Alternative: FTP Upload

If SSH isn't available, use FTP:

1. **Use FileZilla** or similar FTP client
2. **Connect** to Hostinger
3. **Navigate** to `public_html/`
4. **Upload** the entire contents of the `hostinger-deploy/` folder
   - This means: select all files and folders inside `hostinger-deploy/` and upload them
   - The folder structure will be preserved automatically

## What the ZIP Contains

The ZIP file contains:
```
app/
components/
lib/
public/
package.json
next.config.js
.htaccess
... (all other files)
```

When extracted correctly, these folders and files should appear directly in `public_html/`.



