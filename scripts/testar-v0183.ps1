$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "Rota 27 v0.18.3 - preview dos cards refinados + Ajuda Capixaba" -ForegroundColor Cyan
Write-Host "Branch esperada: feature/v0.18.3-capixaba-help" -ForegroundColor DarkGray

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git nao foi encontrado neste computador."
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw "Node.js/npx nao foi encontrado neste computador."
}

$branch = (& git branch --show-current).Trim()
if ($branch -ne "feature/v0.18.3-capixaba-help") {
    throw "Branch atual: $branch. Troque para feature/v0.18.3-capixaba-help antes de abrir a preview."
}

$version = (Get-Content (Join-Path $RepoRoot "VERSION") -Raw).Trim()
if ($version -ne "0.18.3") {
    throw "VERSION local encontrada: $version. Execute git pull --ff-only antes de testar."
}

$port = 3021
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    throw "A porta $port ja esta em uso. Feche o servidor anterior da preview v0.18.3 e execute novamente."
}

# Descobre o IPv4 do adaptador que possui a rota padrao para facilitar o teste em celular na mesma rede Wi-Fi.
$lanIp = $null
try {
    $defaultRoute = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix "0.0.0.0/0" -ErrorAction Stop |
        Where-Object { $_.NextHop -and $_.NextHop -ne "0.0.0.0" } |
        Sort-Object RouteMetric, InterfaceMetric |
        Select-Object -First 1

    if ($defaultRoute) {
        $lanIp = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $defaultRoute.InterfaceIndex -ErrorAction Stop |
            Where-Object {
                $_.IPAddress -notmatch '^127\.' -and
                $_.IPAddress -notmatch '^169\.254\.' -and
                -not $_.SkipAsSource
            } |
            Select-Object -ExpandProperty IPAddress -First 1
    }
} catch {
    $lanIp = $null
}

Write-Host "Iniciando servidor dedicado da v0.18.3 na porta $port..." -ForegroundColor Cyan
$server = Start-Process powershell.exe `
    -WorkingDirectory $RepoRoot `
    -ArgumentList @(
        '-NoProfile',
        '-NoExit',
        '-Command',
        "npx --yes http-server . -a 0.0.0.0 -p $port -c-1"
    ) `
    -PassThru

Write-Host "Aguardando o servidor ficar pronto..." -ForegroundColor DarkGray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    if ($server.HasExited) {
        throw "O servidor da preview encerrou antes de iniciar. Veja a janela PowerShell aberta para o erro do npx/http-server."
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

$Url = "http://localhost:$port/?preview=v0183"
try {
    $probe = Invoke-WebRequest -Uri "http://127.0.0.1:$port/" -UseBasicParsing -TimeoutSec 5
    if ($probe.StatusCode -lt 200 -or $probe.StatusCode -ge 400) {
        throw "HTTP $($probe.StatusCode)"
    }
} catch {
    throw "A porta $port abriu, mas a pagina ainda nao respondeu corretamente: $($_.Exception.Message)"
}

Write-Host "Servidor pronto." -ForegroundColor Green
Write-Host "PC:      $Url" -ForegroundColor Green
if ($lanIp) {
    $MobileUrl = "http://${lanIp}:$port/?preview=v0183"
    Write-Host "CELULAR: $MobileUrl" -ForegroundColor Yellow
    Write-Host "Use o celular na mesma rede Wi-Fi do PC. Se o Windows pedir permissao de firewall, permita em rede Privada." -ForegroundColor DarkGray
} else {
    Write-Host "Nao consegui detectar automaticamente o IP da rede local. A preview no PC continuara funcionando normalmente." -ForegroundColor Yellow
}

Start-Process $Url
