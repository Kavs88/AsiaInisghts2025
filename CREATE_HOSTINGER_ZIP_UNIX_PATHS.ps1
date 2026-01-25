# Create Hostinger-Compatible Zip with Unix-Style Paths
# This script creates a zip with forward slashes (/) instead of backslashes (\)
# Required for Linux servers like Hostinger

$ErrorActionPreference = "Stop"

Write-Output "=== Creating Hostinger-Compatible Zip (Unix Paths) ==="
Write-Output ""

# Load required .NET assemblies
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Navigate to hostinger-deploy
$deployPath = "hostinger-deploy"
if (-not (Test-Path $deployPath)) {
    Write-Output "❌ Error: hostinger-deploy folder not found!"
    exit 1
}

$deployFullPath = Resolve-Path $deployPath
Set-Location $deployFullPath

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
$zipPath = Join-Path (Get-Location).Parent.FullName "hostinger-deploy-unix.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Output "Removed old zip file"
}

# Create zip with Unix-style paths
Write-Output "Step 2: Creating zip file with Unix-style paths..."
Write-Output "This may take a few minutes..."
Write-Output ""

# Create new zip file
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    # Get all files to include (excluding node_modules, .git, .next/cache)
    $filesToInclude = Get-ChildItem -Recurse -File | Where-Object {
        $fullPath = $_.FullName
        $relativePath = $_.FullName.Substring($deployFullPath.Length + 1)
        
        # Exclude patterns
        -not ($relativePath -like "node_modules\*") -and
        -not ($relativePath -like "node_modules") -and
        -not ($relativePath -like ".git\*") -and
        -not ($relativePath -like ".git") -and
        -not ($relativePath -like ".next\cache\*") -and
        -not ($relativePath -like ".next\cache") -and
        -not ($relativePath -like "*.zip") -and
        -not ($relativePath -like "*.log")
    }
    
    $fileCount = 0
    $totalFiles = $filesToInclude.Count
    
    foreach ($file in $filesToInclude) {
        $fileCount++
        if ($fileCount % 100 -eq 0) {
            Write-Output "   Processing file $fileCount of $totalFiles..."
        }
        
        # Get relative path from deploy directory
        $relativePath = $file.FullName.Substring($deployFullPath.Length + 1)
        
        # Convert Windows path separators to Unix-style (forward slashes)
        $unixPath = $relativePath -replace '\\', '/'
        
        # Add file to zip with Unix-style path
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $zip,
            $file.FullName,
            $unixPath,
            [System.IO.Compression.CompressionLevel]::Optimal
        )
    }
    
    Write-Output ""
    Write-Output "   ✅ Processed $fileCount files"
    
} finally {
    $zip.Dispose()
}

if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Output ""
    Write-Output "✅ Zip created successfully with Unix-style paths!"
    Write-Output "   File: hostinger-deploy-unix.zip"
    Write-Output "   Size: $([math]::Round($size, 2)) MB"
    Write-Output ""
    Write-Output "Step 3: Verification..."
    
    # Verify zip contents have forward slashes
    $verifyZip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $hasBackslashes = $false
        foreach ($entry in $verifyZip.Entries) {
            if ($entry.FullName -match '\\') {
                $hasBackslashes = $true
                Write-Output "   ⚠️  Warning: Found backslash in: $($entry.FullName)"
            }
        }
        if (-not $hasBackslashes) {
            Write-Output "   ✅ All paths use forward slashes (Unix-style)"
        }
        
        # Check for key files
        $keyFiles = @("package.json", "next.config.js", "app/layout.tsx", "app/page.tsx")
        foreach ($keyFile in $keyFiles) {
            $found = $verifyZip.Entries | Where-Object { $_.FullName -eq $keyFile }
            if ($found) {
                Write-Output "   ✅ $keyFile included"
            } else {
                Write-Output "   ❌ $keyFile NOT found"
            }
        }
    } finally {
        $verifyZip.Dispose()
    }
    
    Write-Output ""
    Write-Output "=== IMPORTANT: Upload Instructions ==="
    Write-Output "1. Upload hostinger-deploy-unix.zip to Hostinger"
    Write-Output "2. Extract to public_html ROOT (not in subdirectory)"
    Write-Output "3. After extraction, package.json should be at: public_html/package.json"
    Write-Output "4. Use Node.js Web Apps feature for auto-detection"
    Write-Output ""
    Write-Output "✅ This ZIP file uses Unix-style paths (/) and should work on Linux servers!"
    Write-Output ""
} else {
    Write-Output "❌ Failed to create zip file"
    exit 1
}

Set-Location ..


