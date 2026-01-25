# Project Backup Guide

Complete guide for backing up your Sunday Market project.

---

## 📦 What to Backup

### 1. **Code & Configuration**
- All source code files
- Configuration files
- Environment variables (safely)

### 2. **Database**
- Schema (SQL files)
- Migrations
- Seed data

### 3. **Supabase Resources**
- Edge Functions
- Database schema
- Storage buckets (if any)

---

## 🗄️ Database Backup

### Option 1: Export via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard/project/hkssuvamxdnqptyprsom

2. **Export Database:**
   - Go to **Database** → **Backups**
   - Click **Download** on the latest backup
   - Or create a new backup: Click **Create Backup**

### Option 2: Export via Supabase CLI

```powershell
# Create a database dump
supabase db dump -f backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

This creates a SQL file with your entire database schema and data.

### Option 3: Export Schema Only

Your schema files are already in the project:
- `supabase/schema.sql` - Main schema
- `supabase/migrations.sql` - Migrations
- `supabase/seed_data.sql` - Seed data

These are already version controlled!

---

## 💾 Code Backup

### Option 1: Git Repository (Recommended)

If you're using Git:

```powershell
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

# Push to remote
git push
```

### Option 2: Manual Backup

Create a zip file of your project:

```powershell
# Create backup folder
$backupFolder = "C:\Backups\SundayMarket_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupFolder

# Copy project (excluding node_modules)
Copy-Item -Path "." -Destination $backupFolder -Recurse -Exclude "node_modules",".next",".git"

# Create zip
Compress-Archive -Path $backupFolder -DestinationPath "$backupFolder.zip"
```

---

## 🔐 Secrets Backup (Important!)

### Backup Your Secrets Safely

**⚠️ NEVER commit secrets to Git!**

Create a secure backup file (encrypted or password-protected):

1. **List your Supabase secrets:**
   ```powershell
   supabase secrets list
   ```

2. **Document them securely:**
   - Use a password manager (1Password, LastPass, etc.)
   - Or create an encrypted file
   - Store in a secure location (NOT in the project folder)

3. **Create a secrets backup file** (password-protected):
   ```powershell
   # Create a secure backup file
   @"
   RESEND_API_KEY=re_your_key_here
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   WHATSAPP_PHONE_ID=your_phone_id_here
   ZALO_ACCESS_TOKEN=your_token_here
   ZALO_OA_ID=your_oa_id_here
   "# | Out-File -FilePath "secrets_backup.txt" -Encoding UTF8
   ```

   **Then encrypt or password-protect this file!**

---

## 📋 Complete Backup Checklist

### Code & Files:
- [ ] All source code files
- [ ] Configuration files (package.json, tsconfig.json, etc.)
- [ ] SQL files in `supabase/` folder
- [ ] Edge Functions in `supabase/functions/`

### Database:
- [ ] Export database schema
- [ ] Export database data (if needed)
- [ ] Backup migrations
- [ ] Backup seed data

### Supabase:
- [ ] List all Edge Functions
- [ ] Document all secrets (securely!)
- [ ] Export database backup
- [ ] Note project reference ID: `hkssuvamxdnqptyprsom`

### Environment:
- [ ] Backup `.env.local` (securely!)
- [ ] Document all environment variables
- [ ] Note Supabase project URL and keys

---

## 🚀 Automated Backup Script

Create a backup script to automate the process:

```powershell
# backup.ps1
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\Backups\SundayMarket_$timestamp"

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force

# Backup code (excluding large folders)
$exclude = @("node_modules", ".next", ".git", "dist", "build")
Get-ChildItem -Path "." -Exclude $exclude | Copy-Item -Destination $backupDir -Recurse

# Backup database schema
supabase db dump -f "$backupDir\database_backup.sql"

# Create zip
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip" -Force

Write-Host "Backup created: $backupDir.zip"
```

Run it:
```powershell
.\backup.ps1
```

---

## 📍 Backup Locations

### Recommended Backup Locations:

1. **Cloud Storage:**
   - Google Drive
   - Dropbox
   - OneDrive
   - AWS S3
   - Backblaze

2. **Version Control:**
   - GitHub (private repo)
   - GitLab
   - Bitbucket

3. **External Drive:**
   - USB drive
   - External hard drive

---

## 🔄 Restore from Backup

### Restore Database:

```powershell
# Restore from SQL file
supabase db reset  # WARNING: This deletes all data!
# Then import your backup SQL file via Supabase Dashboard SQL Editor
```

### Restore Code:

```powershell
# If using Git
git clone your-repo-url

# If using zip backup
Expand-Archive -Path backup.zip -DestinationPath restore-folder
```

### Restore Secrets:

```powershell
# Set secrets from your secure backup
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set WHATSAPP_ACCESS_TOKEN=your_token
supabase secrets set WHATSAPP_PHONE_ID=your_phone_id
# etc...
```

---

## ⏰ Backup Schedule

### Recommended Backup Frequency:

- **Daily**: Code changes (via Git)
- **Weekly**: Full database backup
- **Monthly**: Complete project backup (code + database + secrets)

### Automated Backups:

Set up automated backups using:
- **Git**: Push regularly
- **Supabase**: Enable automatic backups in dashboard
- **Scripts**: Schedule PowerShell scripts with Task Scheduler

---

## 🛡️ Security Best Practices

1. **Never commit secrets** to Git
2. **Encrypt backup files** containing secrets
3. **Use password managers** for API keys
4. **Store backups** in secure locations
5. **Test restore process** regularly
6. **Keep multiple backup copies** (3-2-1 rule: 3 copies, 2 different media, 1 offsite)

---

## 📝 Quick Backup Commands

```powershell
# 1. Database backup
supabase db dump -f backup_$(Get-Date -Format "yyyyMMdd").sql

# 2. List secrets (document securely)
supabase secrets list

# 3. Git backup
git add . && git commit -m "Backup $(Get-Date)" && git push

# 4. Export Edge Functions list
supabase functions list > functions_backup.txt
```

---

## ✅ Backup Verification

After creating a backup, verify it:

1. **Check file size** (should not be 0 bytes)
2. **Test restore** in a test environment
3. **Verify database** backup can be imported
4. **Check code** backup has all files

---

## 🆘 Emergency Restore

If you need to restore quickly:

1. **Database**: Use Supabase Dashboard → Database → Backups → Restore
2. **Code**: Clone from Git or extract from zip
3. **Secrets**: Set via `supabase secrets set` commands
4. **Functions**: Redeploy with `supabase functions deploy`

---

## 📞 Need Help?

If you need help with:
- Setting up automated backups
- Creating backup scripts
- Restoring from backup
- Securing backup files

Let me know and I can help you set it up!

