param(
  [string]$AppName = "rota27-preview",
  [string]$ResourceGroup = "rg-rota27-preview",
  [string]$Hostname = "rota27.automatrixhub.com.br",
  [string]$Subscription = "",
  [switch]$PrepareTxtValidation
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

function Invoke-AzJson([string[]]$AzArgs) {
  $raw = & az @AzArgs --output json
  if ($LASTEXITCODE -ne 0) { throw "Azure CLI falhou: az $($AzArgs -join ' ')" }
  return ($raw | Out-String | ConvertFrom-Json)
}

function Resolve-Records([string]$Name, [string]$Type) {
  $rows = @()
  if (Get-Command Resolve-DnsName -ErrorAction SilentlyContinue) {
    try {
      $answer = Resolve-DnsName -Name $Name -Type $Type -ErrorAction Stop
      foreach ($row in @($answer)) {
        if ($row.Type -ne $Type -and [string]$row.Type -ne $Type) { continue }
        $value = switch ($Type) {
          "A" { [string]$row.IPAddress }
          "AAAA" { [string]$row.IPAddress }
          "CNAME" { [string]$row.NameHost }
          "TXT" { [string](@($row.Strings) -join "") }
          default { "" }
        }
        if (-not [string]::IsNullOrWhiteSpace($value)) {
          $rows += [ordered]@{ type=$Type; value=$value.TrimEnd('.'); ttl=$row.TTL }
        }
      }
    } catch {}
  } else {
    try {
      $raw = & nslookup "-type=$Type" $Name 2>$null | Out-String
      if ($LASTEXITCODE -eq 0 -and $raw) {
        $rows += [ordered]@{ type=$Type; value="Consulte a saída do nslookup manualmente"; ttl=$null }
      }
    } catch {}
  }
  return @($rows)
}

Require-Command az

$account = $null
try { $account = Invoke-AzJson @("account","show") }
catch { throw "Azure CLI não está autenticado. Execute 'az login' e rode novamente." }

if (-not [string]::IsNullOrWhiteSpace($Subscription)) {
  & az account set --subscription $Subscription
  if ($LASTEXITCODE -ne 0) { throw "Não foi possível selecionar a assinatura Azure informada." }
  $account = Invoke-AzJson @("account","show")
}

$app = Invoke-AzJson @("staticwebapp","show","--name",$AppName,"--resource-group",$ResourceGroup)
$defaultHostname = [string]$app.defaultHostname
if ([string]::IsNullOrWhiteSpace($defaultHostname)) {
  throw "O recurso Azure não retornou defaultHostname."
}
$defaultHostname = $defaultHostname.TrimEnd('.')

$authHost = "_dnsauth.$Hostname"
$dns = [ordered]@{
  hostname = $Hostname
  cname = @(Resolve-Records $Hostname "CNAME")
  a = @(Resolve-Records $Hostname "A")
  aaaa = @(Resolve-Records $Hostname "AAAA")
  validation_txt_host = $authHost
  validation_txt = @(Resolve-Records $authHost "TXT")
}

$existingBinding = $null
try {
  $existingBinding = Invoke-AzJson @("staticwebapp","hostname","show","--name",$AppName,"--resource-group",$ResourceGroup,"--hostname",$Hostname)
} catch {}

Write-Host ""
Write-Host "Rota 27 — preflight do domínio final" -ForegroundColor Cyan
Write-Host "Assinatura:       $($account.name)"
Write-Host "Static Web App:   $AppName"
Write-Host "Resource group:   $ResourceGroup"
Write-Host "Hostname final:   $Hostname"
Write-Host "Destino Azure:    $defaultHostname"
Write-Host "TXT de validação: $authHost"
Write-Host ""

if ($dns.cname.Count -or $dns.a.Count -or $dns.aaaa.Count) {
  Write-Warning "O hostname final já possui registro de roteamento DNS. Não substitua nada sem revisar o destino atual."
  foreach ($row in @($dns.cname + $dns.a + $dns.aaaa)) {
    Write-Host "  DNS atual $($row.type): $($row.value)"
  }
} else {
  Write-Host "Nenhum A/AAAA/CNAME foi detectado pelo resolvedor local para o hostname final."
  Write-Host "Isso NÃO autoriza criar/alterar DNS automaticamente; confirme também no painel do seu provedor."
}

if ($existingBinding) {
  Write-Host "O hostname já possui registro no recurso Azure."
  if ($existingBinding.status) { Write-Host "Status Azure: $($existingBinding.status)" }
  if ($existingBinding.validationToken) { Write-Host "Token TXT disponível no Azure (não será gravado em arquivo)." }
}

if (-not $PrepareTxtValidation) {
  Write-Host ""
  Write-Host "DRY-RUN: nenhuma configuração Azure e nenhum DNS foram alterados." -ForegroundColor Yellow
  Write-Host "Próximo passo seguro, após revisar o diagnóstico:"
  Write-Host "  .\prepare-azure-custom-domain.ps1 -PrepareTxtValidation"
  exit 0
}

if (-not $existingBinding) {
  Write-Host ""
  Write-Host "Solicitando validação TXT no Azure sem alterar o roteamento DNS..."
  & az staticwebapp hostname set `
      --name $AppName `
      --resource-group $ResourceGroup `
      --hostname $Hostname `
      --validation-method dns-txt-token `
      --no-wait `
      --output none
  if ($LASTEXITCODE -ne 0) { throw "Falha ao preparar a validação TXT do domínio no Azure." }
}

$token = ""
for ($attempt=1; $attempt -le 6 -and [string]::IsNullOrWhiteSpace($token); $attempt++) {
  try {
    $token = (& az staticwebapp hostname show `
      --name $AppName `
      --resource-group $ResourceGroup `
      --hostname $Hostname `
      --query "validationToken" `
      --output tsv 2>$null | Out-String).Trim()
  } catch {}
  if ([string]::IsNullOrWhiteSpace($token) -and $attempt -lt 6) { Start-Sleep -Seconds 2 }
}

Write-Host ""
if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Warning "A solicitação foi criada, mas o token TXT ainda não apareceu. Rode novamente sem -PrepareTxtValidation para consultar o estado, ou use 'az staticwebapp hostname show'."
  exit 0
}

Write-Host "Validação TXT preparada no Azure." -ForegroundColor Green
Write-Host "No provedor DNS, crie SOMENTE este TXT primeiro:"
Write-Host "  Host:  $authHost"
Write-Host "  Valor: $token"
Write-Host ""
Write-Host "NÃO altere o CNAME do hostname final nesta etapa."
Write-Host "Depois que o Azure confirmar o domínio, o futuro roteamento será:"
Write-Host "  $Hostname  CNAME  $defaultHostname"
Write-Host ""
Write-Host "Este script não modifica DNS e não grava o token TXT em arquivo."
