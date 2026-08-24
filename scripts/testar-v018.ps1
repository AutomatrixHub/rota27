$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "Rota 27 v0.18.0 - preview local" -ForegroundColor Cyan
Write-Host "Branch esperada: feature/v0.18.0-turn-summary" -ForegroundColor DarkGray

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git nao foi encontrado neste computador."
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw "Node.js/npx nao foi encontrado neste computador."
}

$branch = (& git branch --show-current).Trim()
if ($branch -ne "feature/v0.18.0-turn-summary") {
    throw "Branch atual: $branch. Troque para feature/v0.18.0-turn-summary antes de abrir a preview."
}

$version = (Get-Content (Join-Path $RepoRoot "VERSION") -Raw).Trim()
if ($version -ne "0.18.0") {
    throw "VERSION local encontrada: $version. Execute git pull --ff-only antes de testar."
}

# Porta dedicada para a v0.18.0. Evita reutilizar o servidor/cache antigo de localhost:3000.
$port = 3018
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($listener) {
    throw "A porta $port ja esta em uso. Feche o servidor anterior da preview v0.18 e execute este script novamente."
}

Write-Host "Iniciando servidor dedicado da v0.18.0 na porta $port..." -ForegroundColor Cyan
Start-Process powershell.exe `
    -WorkingDirectory $RepoRoot `
    -ArgumentList @(
        '-NoProfile',
        '-NoExit',
        '-Command',
        "npx --yes http-server . -p $port -c-1"
    )

Start-Sleep -Seconds 3

$Url = "http://localhost:$port/?preview=v018"
Write-Host "Abrindo $Url" -ForegroundColor Green
Start-Process $Url
