param([switch]$Stop)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$composeArgs = @('compose', '-f', (Join-Path $projectRoot 'compose.yaml'), '-f', (Join-Path $projectRoot 'compose.share.yaml'))
$linkPath = Join-Path $projectRoot 'artifacts\share-link.txt'

function Invoke-ProjectCompose {
    param([string[]]$Arguments)
    & docker @composeArgs @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed (exit $LASTEXITCODE). Check Docker Desktop and the output above."
    }
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI is missing. Install/open Docker Desktop first.'
}

# Remove only this project's old tunnel; replacing web with its network namespace
# still in use would leave the tunnel pointing at the old, stopped container.
$oldTunnel = & docker @composeArgs ps -a -q tunnel
if ($LASTEXITCODE -ne 0) { throw 'Cannot read Docker state. Open Docker Desktop first.' }
if ($oldTunnel) {
    Invoke-ProjectCompose -Arguments @('stop', 'tunnel')
    Invoke-ProjectCompose -Arguments @('rm', '-f', 'tunnel')
}
if (Test-Path -LiteralPath $linkPath) { Remove-Item -LiteralPath $linkPath }
if ($Stop) {
    Write-Host 'Sharing stopped. The local website and its data volume are unchanged.'
    exit 0
}

Write-Host 'Starting Solo Leveling by LP (Live Progresssion)...'
Invoke-ProjectCompose -Arguments @('up', '-d', '--build', '--wait', '--wait-timeout', '120', 'web')
Invoke-ProjectCompose -Arguments @('up', '-d', '--no-build', 'tunnel')

$deadline = (Get-Date).AddSeconds(90)
$shareUrl = ''
while ((Get-Date) -lt $deadline) {
    $logs = & docker @composeArgs logs --no-color --tail 120 tunnel | Out-String
    $urlMatch = [regex]::Match($logs, 'https://[a-z0-9-]+\.trycloudflare\.com')
    if ($urlMatch.Success) {
        $shareUrl = $urlMatch.Value
        break
    }
    Start-Sleep -Seconds 2
}
if (-not $shareUrl) {
    throw 'No tunnel URL was returned. Run: docker compose -f compose.yaml -f compose.share.yaml logs --tail 100 tunnel'
}

# DNS/edge readiness may lag behind the printed tunnel URL.
$ready = $false
$deadline = (Get-Date).AddSeconds(60)
while ((Get-Date) -lt $deadline) {
    try {
        $health = Invoke-RestMethod -Uri "$shareUrl/api/v1/health" -TimeoutSec 8
        if ($health.status -eq 'ok') { $ready = $true; break }
    } catch {
        # Retry briefly while the generated hostname becomes reachable.
    }
    Start-Sleep -Seconds 2
}
if (-not $ready) {
    throw "Tunnel URL exists but is not ready: $shareUrl . Check Internet connectivity and tunnel logs."
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $linkPath) | Out-Null
Set-Content -LiteralPath $linkPath -Value $shareUrl -Encoding UTF8
Write-Host ''
Write-Host "LINK FOR LONG: $shareUrl"
Write-Host 'Long can create a personal account on this link.'
Write-Host 'Keep this PC, Docker Desktop and Internet running. A new tunnel gets a new URL.'
Write-Host 'To stop sharing: double-click Tat-Link-Chia-Se.cmd'
