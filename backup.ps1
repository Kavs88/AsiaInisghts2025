# Sunday Market Project Backup Script
# Run this script to create a complete backup of your project

$ErrorActionPreference = "Stop"

# Get timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "SundayMarket_Backup_$timestamp"
$backupDir = Join-Path $PSScriptRoot "backups\$backupName"
$backupZip = "$backupDir.zip"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sunday Market Project Backup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
Write-Host "Creating backup directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Backup code files
Write-Host "Backing up code files..." -ForegroundColor Yellow
$excludeDirs = @("node_modules", ".next", ".git", "dist", "build", "backups", ".vercel")
$excludeFiles = @("*.log", "*.tsbuildinfo")

Get-ChildItem -Path $PSScriptRoot -Recurse | Where-Object {
    $item = $_
    $relativePath = $item.FullName.Substring($PSScriptRoot.Length + 1)
    $shouldExclude = $false
    
    foreach ($exclude in $excludeDirs) {
        if ($relativePath -like "$exclude*") {
            $shouldExclude = $true
            break
        }
    }
    
    if (-not $shouldExclude) {
        foreach ($pattern in $excludeFiles) {
            if ($item.Name -like $pattern) {
                $shouldExclude = $true
                break
            }
        }
    }
    
    -not $shouldExclude
} | Copy-Item -Destination {
    $_.FullName.Replace($PSScriptRoot, $backupDir)
} -Force

# Backup database schema (if Supabase CLI is available)
Write-Host "Backing up database schema..." -ForegroundColor Yellow
try {
    $dbBackupFile = Join-Path $backupDir "database_schema.sql"
    supabase db dump -f $dbBackupFile 2>&1 | Out-Null
    if (Test-Path $dbBackupFile) {
        Write-Host "  ✓ Database schema backed up" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Database backup skipped (not linked or CLI issue)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ Database backup skipped: $_" -ForegroundColor Yellow
}

# Create backup info file
Write-Host "Creating backup info file..." -ForegroundColor Yellow
$backupInfo = @"
Sunday Market Project Backup
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: Sunday Market
Supabase Project: hkssuvamxdnqptyprsom

Backup Contents:
- Source code
- Configuration files
- SQL schema files
- Edge Functions
- Database schema (if available)

IMPORTANT:
- Secrets are NOT included in this backup
- Store secrets separately in a secure location
- .env.local is excluded for security

To restore:
1. Extract this backup
2. Run: npm install
3. Restore database from database_schema.sql
4. Set up .env.local with your credentials
5. Deploy Edge Functions: supabase functions deploy
"@

$backupInfo | Out-File -FilePath (Join-Path $backupDir "BACKUP_INFO.txt") -Encoding UTF8

# Create zip archive
Write-Host "Creating zip archive..." -ForegroundColor Yellow
Compress-Archive -Path $backupDir -DestinationPath $backupZip -Force

# Clean up temp directory
Remove-Item -Path $backupDir -Recurse -Force

# Display results
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Location: $backupZip" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round((Get-Item $backupZip).Length / 1MB, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠ Remember to backup your secrets separately!" -ForegroundColor Yellow
Write-Host ""





