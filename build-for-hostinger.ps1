# Build Script for Hostinger Deployment
# Run this script to build and prepare your app for Hostinger

Write-Output "=== Building Next.js App for Hostinger ==="
Write-Output ""

# Navigate to hostinger-deploy folder
$deployPath = "hostinger-deploy"
if (-not (Test-Path $deployPath)) {
    Write-Output "❌ Error: hostinger-deploy folder not found!"
    Write-Output "Please run this script from the project root directory."
    exit 1
}

Set-Location $deployPath

Write-Output "Step 1: Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Output "❌ npm install failed!"
    exit 1
}

Write-Output ""
Write-Output "Step 2: Building Next.js application..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Output "❌ Build failed!"
    exit 1
}

Write-Output ""
Write-Output "Step 3: Verifying .next folder..."
if (Test-Path ".next") {
    Write-Output "✅ .next folder created successfully!"
} else {
    Write-Output "❌ .next folder not found! Build may have failed."
    exit 1
}

Write-Output ""
Write-Output "=== Build Complete! ==="
Write-Output ""
Write-Output "Next steps:"
Write-Output "1. Create a zip file including the .next folder"
Write-Output "2. Upload to Hostinger"
Write-Output "3. Configure Node.js app with:"
Write-Output "   - Startup File: node_modules/next/dist/bin/next"
Write-Output "   - Arguments: start"
Write-Output ""
Write-Output "See BUILD_AND_PACKAGE_INSTRUCTIONS.md for details."

Set-Location ..


