$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "Rota 27 v0.18.2 - preview do tema oficial" -ForegroundColor Cyan
Write-Host "Branch esperada: feature/v0.18.2-brand-theme" -ForegroundColor DarkGray

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git nao foi encontrado neste computador."
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw "Node.js/npx nao foi encontrado neste computador."
}

$branch = (& git branch --show-current).Trim()
if ($branch -ne "feature/v0.18.2-brand-theme") {
    throw "Branch atual: $branch. Troque para feature/v0.18.2-brand-theme antes de abrir a preview."
}

$version = (Get-Content (Join-Path $RepoRoot "VERSION") -Raw).Trim()
if ($version -ne "0.18.2") {
    throw "VERSION local encontrada: $version. Execute git pull --ff-only antes de testar."
}

$port = 3020
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    throw "A porta $port ja esta em uso. Feche o servidor anterior da preview v0.18.2 e execute novamente."
}

Write-Host "Iniciando servidor dedicado da v0.18.2 na porta $port..." -ForegroundColor Cyan
$server = Start-Process powershell.exe `
    -WorkingDirectory $RepoRoot `
    -ArgumentList @(
        '-NoProfile',
        '-NoExit',
        '-Command',
        "npx --yes http-server . -p $port -c-1"
    ) `
    -PassThru

Write-Host "Aguardando o servidor ficar pronto..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1

    if ($server.HasExited) {
        throw "O servidor da preview encerrou antes de iniciar. Veja a janela PowerShell que foi aberta para o erro do npx/http-server."
    }

    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        $ready = $true
        break
    }
}

if (-not $ready) {
    throw "O servidor nao ficou disponivel na porta $port em 30 segundos. Veja a janela PowerShell do servidor para identificar o erro."
}

$Url = "http://localhost:$port/?preview=v0182"

try {
    $probe = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 5
    if ($probe.StatusCode -lt 200 -or $probe.StatusCode -ge 400) {
        throw "HTTP $($probe.StatusCode)"
    }
} catch {
    throw "A porta $port abriu, mas a pagina ainda nao respondeu corretamente: $($_.Exception.Message)"
}

Write-Host "Servidor pronto." -ForegroundColor Green
Write-Host "Abrindo $Url" -ForegroundColor Green
Start-Process $Url
