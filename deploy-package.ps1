# PowerShell script to create deployment package for Hostinger
# Run this script to prepare files for upload

Write-Host "Creating Hostinger deployment package..." -ForegroundColor Green

# Create deployment directory
$deployDir = "hostinger-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "Copying source files..." -ForegroundColor Yellow

# Copy essential directories
$dirsToCopy = @(
    "app",
    "components",
    "lib",
    "actions",
    "contexts",
    "types",
    "public",
    "supabase"
)

foreach ($dir in $dirsToCopy) {
    if (Test-Path $dir) {
        Write-Host "  Copying $dir..." -ForegroundColor Gray
        Copy-Item -Path $dir -Destination "$deployDir\$dir" -Recurse -Force
    }
}

# Copy essential files
$filesToCopy = @(
    "package.json",
    "package-lock.json",
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    "middleware.ts",
    ".htaccess",
    "env.template",
    "HOSTINGER_DEPLOYMENT.md"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Write-Host "  Copying $file..." -ForegroundColor Gray
        Copy-Item -Path $file -Destination "$deployDir\$file" -Force
    }
}

# Create .gitignore for deployment
$gitignoreContent = @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
"@

Set-Content -Path "$deployDir\.gitignore" -Value $gitignoreContent

# Create README for deployment
$readmeContent = @"
# Sunday Market - Hostinger Deployment Package

## Quick Start

1. Upload all files to your Hostinger server (via FTP or File Manager)
2. SSH into your server and navigate to the project directory
3. Run: `npm install --production`
4. Run: `npm run build`
5. Create `.env.local` file with your Supabase credentials (see .env.example)
6. Configure Node.js app in Hostinger hPanel
7. Start the application: `npm start`

## Important Files

- `.env.example` - Template for environment variables
- `HOSTINGER_DEPLOYMENT.md` - Full deployment guide
- `.htaccess` - Apache configuration for Next.js routing

## Support

See HOSTINGER_DEPLOYMENT.md for detailed instructions and troubleshooting.
"@

Set-Content -Path "$deployDir\README.md" -Value $readmeContent

Write-Host "`nDeployment package created in: $deployDir" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review the files in $deployDir" -ForegroundColor White
Write-Host "2. Create a ZIP file of the contents" -ForegroundColor White
Write-Host "3. Upload to Hostinger via File Manager or FTP" -ForegroundColor White
Write-Host "4. Follow instructions in HOSTINGER_DEPLOYMENT.md" -ForegroundColor White

# Optionally create ZIP
$createZip = Read-Host "`nCreate ZIP file? (y/n)"
if ($createZip -eq "y" -or $createZip -eq "Y") {
    $zipFile = "hostinger-deploy.zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    Write-Host "Creating ZIP file..." -ForegroundColor Yellow
    Compress-Archive -Path "$deployDir\*" -DestinationPath $zipFile -Force
    Write-Host "ZIP file created: $zipFile" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Green

