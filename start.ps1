param([int]$Port = 8000)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (Test-Path -LiteralPath '.env') {
    foreach ($line in Get-Content -LiteralPath '.env') {
        if ($line -match '^\s*((?:SOLO_|SMTP_)[A-Z_]+)\s*=\s*(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim().Trim('"').Trim("'"), 'Process')
        }
    }
}

if (-not (Test-Path -LiteralPath 'dist/index.html')) {
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'Khong the cai thu vien Angular.' }
    }
    & node node_modules/@angular/cli/bin/ng.js build
    if ($LASTEXITCODE -ne 0) { throw 'Build frontend that bai.' }
}

$taskPython = (Get-Command python).Source
if (Test-Path -LiteralPath '.venv/Scripts/python.exe') {
    $taskPython = Join-Path $PSScriptRoot '.venv/Scripts/python.exe'
}
& $taskPython -c 'import fastapi, uvicorn, pydantic, zoneinfo; zoneinfo.ZoneInfo("Asia/Ho_Chi_Minh")' 2>$null
if ($LASTEXITCODE -ne 0) {
    & python -m venv .venv
    if ($LASTEXITCODE -ne 0) { throw 'Can Python 3.11 tro len.' }
    $taskPython = Join-Path $PSScriptRoot '.venv/Scripts/python.exe'
    & $taskPython -m pip install -r backend/requirements.txt
    if ($LASTEXITCODE -ne 0) { throw 'Khong the cai thu vien Python.' }
}

Write-Host "Solo Leveling: http://127.0.0.1:$Port" -ForegroundColor Cyan
Write-Host 'Mo lien ket tren trong trinh duyet. Nhan Ctrl+C de dung.'
& $taskPython -m uvicorn backend.app.main:app --host 127.0.0.1 --port $Port
