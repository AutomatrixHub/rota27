$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "Rota 27 v0.18.0 - preview local" -ForegroundColor Cyan
Write-Host "Branch esperada: feature/v0.18.0-turn-summary" -ForegroundColor DarkGray

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw "Node.js/npx nao foi encontrado neste computador."
}

$port = 3000
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if (-not $listener) {
    Write-Host "Iniciando servidor local na porta $port..." -ForegroundColor Cyan
    Start-Process powershell.exe `
        -WorkingDirectory $RepoRoot `
        -ArgumentList @(
            '-NoProfile',
            '-NoExit',
            '-Command',
            "npx --yes http-server . -p $port -c-1"
        )
    Start-Sleep -Seconds 3
}
else {
    Write-Host "Ja existe um servidor ouvindo na porta $port." -ForegroundColor DarkGray
}

$Url = "http://localhost:$port/"
Write-Host "Abrindo $Url" -ForegroundColor Green
Start-Process $Url
