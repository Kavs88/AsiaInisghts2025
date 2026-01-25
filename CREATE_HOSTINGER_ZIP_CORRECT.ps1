# Create Hostinger-Compatible Zip
# This script creates a zip with files at root level for proper framework detection

$ErrorActionPreference = "Stop"

Write-Output "=== Creating Hostinger-Compatible Zip ==="
Write-Output ""

# Navigate to hostinger-deploy
$deployPath = "hostinger-deploy"
if (-not (Test-Path $deployPath)) {
    Write-Output "❌ Error: hostinger-deploy folder not found!"
    exit 1
}

Set-Location $deployPath

# Verify required files
Write-Output "Step 1: Verifying required files..."
$required = @(
    "package.json",
    "next.config.js",
    "app/layout.tsx",
    "app/page.tsx",
    "package-lock.json"
)

$missing = @()
foreach ($file in $required) {
    if (-not (Test-Path $file)) {
        $missing += $file
    }
}

if ($missing.Count -gt 0) {
    Write-Output "❌ Missing required files:"
    $missing | ForEach-Object { Write-Output "   - $_" }
    exit 1
}
Write-Output "✅ All required files present"
Write-Output ""

# Remove old zip
$zipPath = "..\hostinger-deploy-ready.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Output "Removed old zip file"
}

# Create zip excluding node_modules and .next cache files
Write-Output "Step 2: Creating zip file (excluding node_modules)..."
Write-Output "This may take a few minutes..."

$filesToZip = Get-ChildItem -Exclude "node_modules", ".git", ".next/cache" | 
    Where-Object { $_.Name -ne "node_modules" }

Compress-Archive -Path $filesToZip -DestinationPath $zipPath -CompressionLevel Optimal -Force

if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Output ""
    Write-Output "✅ Zip created successfully!"
    Write-Output "   File: hostinger-deploy-ready.zip"
    Write-Output "   Size: $([math]::Round($size, 2)) MB"
    Write-Output ""
    Write-Output "Step 3: Verification..."
    Write-Output "   ✅ package.json included"
    Write-Output "   ✅ next.config.js included"
    Write-Output "   ✅ app/ directory included"
    Write-Output "   ✅ package-lock.json included"
    Write-Output ""
    Write-Output "=== IMPORTANT: Extraction Instructions ==="
    Write-Output "1. Upload hostinger-deploy-ready.zip to Hostinger"
    Write-Output "2. Extract to public_html ROOT (not in subdirectory)"
    Write-Output "3. After extraction, package.json should be at: public_html/package.json"
    Write-Output "4. Use Node.js Web Apps feature for auto-detection"
    Write-Output ""
} else {
    Write-Output "❌ Failed to create zip file"
    exit 1
}

Set-Location ..


