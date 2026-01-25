# Prepare Hostinger Standalone Package
# This script creates a 'hostinger-upload.zip' ready for VPS/Node.js deployment

$ErrorActionPreference = "Stop"

Write-Host "=== Preparing Hostinger Deployment Package ===" -ForegroundColor Cyan

# 1. Verification
if (!(Test-Path "package.json")) {
    Write-Error "Please run this from the project root."
}

# 2. Build
Write-Host "`nStep 1: Building Project (Standalone Mode)..." -ForegroundColor Yellow
$env:NEXT_PRIVATE_STANDALONE = "true"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Please check errors above."
}

# 3. Create Staging Directory
$buildDir = ".next/standalone"
if (!(Test-Path $buildDir)) {
    Write-Error "Standalone build missing. Ensure 'output: standalone' is in next.config.js"
}

# 4. Copy Static Assets (Required for Standalone)
Write-Host "`nStep 2: Organizing Assets..." -ForegroundColor Yellow

# Copy public folder to standalone/public
if (Test-Path "public") {
    Write-Host "  - Copying public folder..."
    Copy-Item -Path "public" -Destination "$buildDir" -Recurse -Force
}

# Copy .next/static to standalone/.next/static
$staticDest = "$buildDir/.next/static"
if (!(Test-Path $staticDest)) {
    New-Item -ItemType Directory -Force -Path $staticDest | Out-Null
}
Write-Host "  - Copying static assets..."
Copy-Item -Path ".next/static/*" -Destination $staticDest -Recurse -Force

# 5. Create Zip
Write-Host "`nStep 3: Zipping Package..." -ForegroundColor Yellow
$zipFile = "hostinger-upload.zip"

if (Test-Path $zipFile) { Remove-Item $zipFile }

Compress-Archive -Path "$buildDir\*" -DestinationPath $zipFile

Write-Host "`n✅ SUCCESS: Package created at: $pwd\$zipFile" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "UPLOAD INSTRUCTIONS:"
Write-Host "1. Upload '$zipFile' to Hostinger file manager (public_html)."
Write-Host "2. Extract the zip."
Write-Host "3. Setup Node.js in Hostinger Dashboard."
Write-Host "4. Important: Set startup file to 'server.js'."
Write-Host "5. Click 'Restart' or 'Start'."
Write-Host "   (No need to run npm install on server with standalone build!)"
Write-Host "---------------------------------------------------"
