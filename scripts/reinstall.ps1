# Build and reinstall MdExplorer locally
Set-Location (Split-Path $PSScriptRoot -Parent)

Write-Host "Building MdExplorer..." -ForegroundColor Cyan
npm run make
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed." -ForegroundColor Red
    exit 1
}

$setup = Get-ChildItem "out\make\squirrel.windows\x64\*Setup*.exe" | Select-Object -First 1
if (-not $setup) {
    Write-Host "Setup exe not found." -ForegroundColor Red
    exit 1
}

# Uninstall existing version if present
$updater = "$env:LocalAppData\MdExplorer\Update.exe"
if (Test-Path $updater) {
    Write-Host "Uninstalling previous version..." -ForegroundColor Yellow
    Start-Process $updater "--uninstall" -Wait
    Start-Sleep -Seconds 2
}

Write-Host "Installing $($setup.Name)..." -ForegroundColor Cyan
Start-Process $setup.FullName -Wait

Write-Host "Done. MdExplorer installed." -ForegroundColor Green
