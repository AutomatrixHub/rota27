$ErrorActionPreference = 'Stop'

$ExpectedBranch = 'feature/v0.15-multidispositivo'
$Port = 3000
$PreviewPath = 'v015-preview.html?dev=2&lab=android'

function Get-Rota27LanIPv4 {
    $routes = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '0.0.0.0/0' -ErrorAction SilentlyContinue |
        Where-Object { $_.NextHop -and $_.NextHop -ne '0.0.0.0' } |
        Sort-Object RouteMetric, InterfaceMetric

    foreach ($route in $routes) {
        $ip = Get-NetIPAddress -AddressFamily IPv4 -InterfaceIndex $route.InterfaceIndex -ErrorAction SilentlyContinue |
            Where-Object {
                $_.IPAddress -ne '127.0.0.1' -and
                $_.IPAddress -notlike '169.254.*' -and
                $_.AddressState -eq 'Preferred'
            } |
            Select-Object -First 1
        if ($ip) { return $ip.IPAddress }
    }

    $fallback = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
            $_.IPAddress -ne '127.0.0.1' -and
            $_.IPAddress -notlike '169.254.*' -and
            $_.AddressState -eq 'Preferred'
        } |
        Select-Object -First 1
    return $fallback.IPAddress
}

$branch = (git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel ler a branch Git atual.' }
if ($branch -ne $ExpectedBranch) {
    throw "Branch incorreta. Esperado: $ExpectedBranch | Atual: $branch"
}

$lanIp = Get-Rota27LanIPv4
if (-not $lanIp) {
    throw 'Nao foi possivel detectar um IPv4 de rede local. Conecte o PC a mesma rede Wi-Fi/LAN do Android.'
}

$repo = (Get-Location).Path
$localUrl = "http://localhost:$Port/$PreviewPath"
$androidUrl = "http://${lanIp}:$Port/$PreviewPath"

Write-Host ''
Write-Host 'Rota 27 v0.15 DEV.2 - Android Lab pela rede local' -ForegroundColor Cyan
Write-Host "Branch: $branch"
Write-Host "PC:      $localUrl"
Write-Host "Android: $androidUrl" -ForegroundColor Green
Write-Host ''
Write-Host 'Use somente em uma rede privada/confiavel.' -ForegroundColor Yellow
Write-Host 'Se o Windows Firewall perguntar, permita apenas em Redes privadas.' -ForegroundColor Yellow
Write-Host 'Nao desinstale nem limpe dados da PWA de producao v0.14 no Android.' -ForegroundColor Yellow
Write-Host ''

$listener = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $listener) {
    $escapedRepo = $repo.Replace("'", "''")
    $serverCmd = "Set-Location '$escapedRepo'; npx --yes http-server . -a 0.0.0.0 -p $Port -c-1"
    Start-Process powershell.exe -ArgumentList '-NoExit','-Command',$serverCmd | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "Servidor de laboratorio iniciado na porta $Port." -ForegroundColor Green
} else {
    Write-Host "Ja existe um servidor escutando na porta $Port; ele sera reutilizado." -ForegroundColor DarkYellow
}

Start-Process $localUrl

Write-Host ''
Write-Host 'No Android:' -ForegroundColor Cyan
Write-Host '1. Mantenha o app instalado v0.14 fechado.'
Write-Host '2. Abra o Chrome e digite exatamente a URL Android exibida acima.'
Write-Host '3. Confirme no topo do Rota 27: v0.15 DEV.2.'
Write-Host '4. Configure Sincronizacao entre aparelhos e use Adotar base compartilhada.'
Write-Host '5. Para encerrar o laboratorio, feche a janela do http-server no PC.'
Write-Host ''
Write-Host 'Observacao: este acesso HTTP pela LAN e destinado a teste no navegador. Nao substitui a PWA de producao.' -ForegroundColor DarkYellow
