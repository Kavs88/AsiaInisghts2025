$src = 'c:\Users\admin\Sunday Market Project'
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$tmp = "$src\backups\tmp_$timestamp"
$out = "$src\backups\SundayMarket_Backup_$timestamp.zip"

New-Item -ItemType Directory -Path $tmp -Force | Out-Null
New-Item -ItemType Directory -Path "$src\backups" -Force | Out-Null

# Copy only source code folders
@('app', 'components', 'lib', 'types', 'public', 'supabase', 'scripts') | ForEach-Object {
    if (Test-Path "$src\$_") {
        Copy-Item "$src\$_" "$tmp\$_" -Recurse -Force
    }
}

# Copy root config files (no package-lock to keep size down)
Get-ChildItem $src -File | Where-Object {
    $_.Extension -in @('.json', '.js', '.ts', '.md', '.css', '.ps1') -and $_.Name -ne 'package-lock.json'
} | Copy-Item -Destination $tmp -Force

Compress-Archive -Path "$tmp\*" -DestinationPath $out -CompressionLevel Fastest -Force
Remove-Item $tmp -Recurse -Force

$size = [math]::Round((Get-Item $out).Length / 1MB, 2)
Write-Host "Backup complete: $out ($size MB)" -ForegroundColor Green
