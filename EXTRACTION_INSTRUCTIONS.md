# Hostinger ZIP Extraction Instructions

## ✅ Correct Extraction Method

When extracting `hostinger-deploy.zip` in Hostinger File Manager:

### Option 1: Extract to Current Directory (Recommended)

1. **Upload** `hostinger-deploy.zip` to `public_html/` folder
2. **Right-click** the ZIP file
3. **Select "Extract"** or "Extract Here"
4. **Choose extraction location**: Select `public_html/` (current directory)
5. **Extract** - All files will be extracted directly into `public_html/`

### Option 2: If File Manager Asks for Folder Name

If Hostinger's File Manager asks for a folder name:

1. **Enter**: `.` (just a dot/period)
2. This tells it to extract to the current directory (`public_html/`)
3. **OR** leave it blank and click Extract

### Expected Result After Extraction

After extraction, your `public_html/` folder should contain:

```
public_html/
├── app/
├── components/
├── lib/
├── public/
├── package.json
├── next.config.js
├── .htaccess
├── env.template
└── ... (all other files)
```

**NOT** this structure:
```
public_html/
└── hostinger-deploy/
    ├── app/
    ├── components/
    └── ...
```

## ⚠️ If Files Extracted to a Subfolder

If files ended up in `public_html/hostinger-deploy/`:

1. **Go into** the `hostinger-deploy/` folder
2. **Select all files** (Ctrl+A or Cmd+A)
3. **Cut/Move** them up one level to `public_html/`
4. **Delete** the empty `hostinger-deploy/` folder

## Alternative: Extract via SSH

If File Manager is problematic, use SSH:

```bash
cd public_html
unzip hostinger-deploy.zip
rm hostinger-deploy.zip
```

This extracts all files directly to `public_html/`.

## Verification

After extraction, verify the structure:

```bash
cd public_html
ls -la
```

You should see:
- `app/` folder
- `components/` folder
- `package.json` file
- `next.config.js` file

If you see a `hostinger-deploy/` folder instead, move the contents up one level.



