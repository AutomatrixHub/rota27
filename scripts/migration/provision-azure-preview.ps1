param(
  [Parameter(Mandatory=$true)]
  [string]$BaselineDir,
  [string]$Subscription = "",
  [string]$ResourceGroup = "rg-rota27-preview",
  [string]$AppName = "rota27-preview",
  [string]$Location = "eastus2",
  [ValidateSet("Free","Standard")]
  [string]$Sku = "Free",
  [switch]$ConfirmPaidSku,
  [switch]$Apply
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

function Invoke-Swa([string[]]$SwaArgs) {
  if (Get-Command swa -ErrorAction SilentlyContinue) {
    & swa @SwaArgs
  } else {
    Require-Command npx
    & npx --yes @azure/static-web-apps-cli@latest @SwaArgs
  }
  if ($LASTEXITCODE -ne 0) { throw "Azure Static Web Apps CLI falhou." }
}

Require-Command az

$baseline = (Resolve-Path $BaselineDir -ErrorAction Stop).Path
foreach ($required in @("index.html","base-v013.html","sw.js","manifest.webmanifest","staticwebapp.config.json")) {
  if (-not (Test-Path (Join-Path $baseline $required) -PathType Leaf)) {
    throw "Baseline incompleto: $required não encontrado em $baseline"
  }
}

$account = $null
try {
  $account = Invoke-AzJson @("account","show")
} catch {
  throw "Azure CLI não está autenticado. Execute 'az login' e rode novamente."
}

if (-not [string]::IsNullOrWhiteSpace($Subscription)) {
  & az account set --subscription $Subscription
  if ($LASTEXITCODE -ne 0) { throw "Não foi possível selecionar a assinatura Azure informada." }
  $account = Invoke-AzJson @("account","show")
}

if ($Sku -eq "Standard" -and -not $ConfirmPaidSku) {
  throw "SKU Standard pode gerar cobrança. Para usá-lo, informe também -ConfirmPaidSku. Para preview, mantenha o padrão Free."
}

$sourceSha = "unknown"
$baselineMeta = Join-Path $baseline "MIGRATION-BASELINE.txt"
if (Test-Path $baselineMeta) {
  $line = Get-Content $baselineMeta | Where-Object { $_ -like "source_sha=*" } | Select-Object -First 1
  if ($line) { $sourceSha = ($line -split "=",2)[1].Trim() }
}

Write-Host ""
Write-Host "Plano Azure Static Web Apps" -ForegroundColor Cyan
Write-Host "Assinatura:      $($account.name)"
Write-Host "Tenant:          $($account.tenantId)"
Write-Host "Resource group:  $ResourceGroup"
Write-Host "Static Web App:  $AppName"
Write-Host "Região:          $Location"
Write-Host "SKU:             $Sku"
Write-Host "Baseline:        $baseline"
Write-Host "Source SHA:      $sourceSha"
Write-Host "DNS produção:    NÃO SERÁ ALTERADO"
Write-Host ""

if (-not $Apply) {
  Write-Host "Dry-run concluído. Nenhum recurso Azure foi criado." -ForegroundColor Yellow
  Write-Host "Para executar exatamente este plano, acrescente -Apply."
  exit 0
}

$groupExists = $false
& az group show --name $ResourceGroup --output none 2>$null
if ($LASTEXITCODE -eq 0) { $groupExists = $true }
if (-not $groupExists) {
  Write-Host "Criando resource group..."
  & az group create --name $ResourceGroup --location $Location --output none
  if ($LASTEXITCODE -ne 0) { throw "Falha ao criar resource group." }
}

& az staticwebapp show --name $AppName --resource-group $ResourceGroup --output none 2>$null
if ($LASTEXITCODE -eq 0) {
  throw "Já existe uma Static Web App chamada '$AppName' em '$ResourceGroup'. O script não sobrescreve recursos existentes."
}

Write-Host "Criando Static Web App isolada de preview..."
& az staticwebapp create --name $AppName --resource-group $ResourceGroup --location $Location --sku $Sku --output none
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar Azure Static Web App. Verifique disponibilidade regional/policies da assinatura." }

$token = (& az staticwebapp secrets list --name $AppName --resource-group $ResourceGroup --query "properties.apiKey" --output tsv | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($token)) {
  throw "Static Web App criada, mas não foi possível obter o deployment token."
}

$previousToken = $env:SWA_CLI_DEPLOYMENT_TOKEN
$env:SWA_CLI_DEPLOYMENT_TOKEN = $token
$token = $null
try {
  Write-Host "Publicando baseline na produção DO RECURSO DE PREVIEW (não é o domínio Rota 27)..."
  Invoke-Swa @("deploy",$baseline,"--env","production")
} finally {
  if ($null -eq $previousToken) { Remove-Item Env:SWA_CLI_DEPLOYMENT_TOKEN -ErrorAction SilentlyContinue }
  else { $env:SWA_CLI_DEPLOYMENT_TOKEN = $previousToken }
}

$hostname = (& az staticwebapp show --name $AppName --resource-group $ResourceGroup --query "defaultHostname" --output tsv | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($hostname)) {
  throw "Deploy concluído, mas o hostname do preview não pôde ser obtido."
}

$baseUrl = "https://$hostname"
$checks = @()
foreach ($path in @("/","/index.html","/sw.js","/manifest.webmanifest")) {
  $url = "$baseUrl$path"
  try {
    $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 30 -UseBasicParsing
    $checks += [ordered]@{
      path = $path
      status = [int]$response.StatusCode
      cache_control = [string]$response.Headers["Cache-Control"]
      content_type = [string]$response.Headers["Content-Type"]
    }
  } catch {
    $checks += [ordered]@{ path=$path; status=0; error=$_.Exception.Message }
  }
}

$result = [ordered]@{
  created_at = [DateTimeOffset]::Now.ToString("o")
  subscription_name = $account.name
  subscription_id = $account.id
  resource_group = $ResourceGroup
  app_name = $AppName
  location = $Location
  sku = $Sku
  source_sha = $sourceSha
  preview_url = $baseUrl
  dns_changed = $false
  checks = $checks
}
$resultPath = Join-Path (Split-Path $baseline -Parent) "azure-preview-result.json"
$result | ConvertTo-Json -Depth 6 | Set-Content -Path $resultPath -Encoding UTF8

$bad = $checks | Where-Object { $_.status -ne 200 }
if ($bad) {
  Write-Warning "O recurso foi criado, mas um ou mais probes não retornaram HTTP 200. Revise $resultPath antes de qualquer homologação."
} else {
  Write-Host ""
  Write-Host "Azure preview publicado e probes básicos aprovados." -ForegroundColor Green
}
Write-Host "URL:       $baseUrl"
Write-Host "Resultado: $resultPath"
Write-Host "DNS de produção não foi alterado."
