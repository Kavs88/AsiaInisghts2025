# Phase 2 Deployment Script for Sunday Market Project
# Usage: .\deploy-phase2.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Phase 2 Deployment - Properties, Events, Businesses" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Verify Supabase connection
Write-Host "`n[1/5] Verifying Supabase connection..." -ForegroundColor Yellow
$status = supabase status
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Supabase not linked. Run 'supabase link' first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Supabase connection verified" -ForegroundColor Green

# 2. Deploy Edge Functions
Write-Host "`n[2/5] Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host "  - Deploying properties-crud..." -ForegroundColor Gray
supabase functions deploy properties-crud
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy properties-crud" -ForegroundColor Red
    exit 1
}

Write-Host "  - Deploying events-crud..." -ForegroundColor Gray
supabase functions deploy events-crud
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy events-crud" -ForegroundColor Red
    exit 1
}

Write-Host "  - Deploying businesses-crud..." -ForegroundColor Gray
supabase functions deploy businesses-crud
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy businesses-crud" -ForegroundColor Red
    exit 1
}
Write-Host "✅ All Edge Functions deployed" -ForegroundColor Green

# 3. Run Migrations
Write-Host "`n[3/5] Running database migrations..." -ForegroundColor Yellow
Write-Host "  - This will run: 006, 007, 008" -ForegroundColor Gray
$confirm = Read-Host "Continue with migrations? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Migrations skipped. Run manually via: supabase db push" -ForegroundColor Yellow
} else {
    supabase db push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Migration push failed. Run migrations manually via SQL Editor." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Migrations completed" -ForegroundColor Green
    }
}

# 4. Verify Functions
Write-Host "`n[4/5] Verifying Edge Functions..." -ForegroundColor Yellow
supabase functions list
Write-Host "✅ Function verification complete" -ForegroundColor Green

# 5. Summary
Write-Host "`n[5/5] Deployment Summary" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Edge Functions deployed" -ForegroundColor Green
Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "   1. Verify RLS policies in Supabase Dashboard SQL Editor" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor White
Write-Host "   3. Run: npm run test:e2e" -ForegroundColor White
Write-Host "   4. Test admin dashboard: /markets/admin" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan






