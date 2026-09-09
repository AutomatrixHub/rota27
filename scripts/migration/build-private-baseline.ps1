param(
  [string]$SourceRepo = "https://github.com/AutomatrixHub/rota27.git",
  [string]$SourceSha = "5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72",
  [string]$SecurityOverlaySha = "82a1f3067ef6660bff834d10dedb7cf4dbfc1979",
  [string]$DestinationRoot = (Join-Path (Get-Location) "ROTA27-PRE-AZURE-20260909"),
  [string]$PrivateRepo = "",
  [switch]$CreatePrivateRepo
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

function Run-Git([string]$WorkingDir, [string[]]$GitArgs) {
  Push-Location $WorkingDir
  try {
    & git @GitArgs
    if ($LASTEXITCODE -ne 0) { throw "git $($GitArgs -join ' ') falhou com código $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

function Copy-IfExists([string]$Source, [string]$Destination) {
  if (-not (Test-Path $Source -PathType Leaf)) { return $false }
  New-Item -ItemType Directory -Path (Split-Path $Destination -Parent) -Force | Out-Null
  Copy-Item -LiteralPath $Source -Destination $Destination -Force
  return $true
}

Require-Command git

if (Test-Path $DestinationRoot) {
  throw "O diretório de destino já existe: $DestinationRoot. Escolha outro caminho para evitar sobrescrita acidental."
}

$MirrorDir   = Join-Path $DestinationRoot "mirror\rota27.git"
$SourceDir   = Join-Path $DestinationRoot "source"
$BaselineDir = Join-Path $DestinationRoot "baseline"
$ArtifactDir = Join-Path $DestinationRoot "artifacts"

New-Item -ItemType Directory -Path (Split-Path $MirrorDir -Parent) -Force | Out-Null
New-Item -ItemType Directory -Path $ArtifactDir -Force | Out-Null

Write-Host "[1/9] Criando espelho integral do Git..."
& git clone --mirror $SourceRepo $MirrorDir
if ($LASTEXITCODE -ne 0) { throw "Falha ao criar mirror do repositório." }

$BundlePath = Join-Path $ArtifactDir "rota27-history-20260909.bundle"
Run-Git $MirrorDir @("bundle", "create", $BundlePath, "--all")
$BundleHash = (Get-FileHash -Algorithm SHA256 $BundlePath).Hash.ToLowerInvariant()
Set-Content -Path (Join-Path $ArtifactDir "rota27-history-20260909.bundle.sha256.txt") -Value "$BundleHash  rota27-history-20260909.bundle" -Encoding UTF8

Write-Host "[2/9] Materializando exatamente o commit de produção..."
& git clone --no-checkout $SourceRepo $SourceDir
if ($LASTEXITCODE -ne 0) { throw "Falha ao clonar árvore de trabalho." }
Run-Git $SourceDir @("checkout", "--detach", $SourceSha)
$ResolvedSha = (& git -C $SourceDir rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $ResolvedSha -ne $SourceSha) {
  throw "SHA materializado não confere. Esperado=$SourceSha Obtido=$ResolvedSha"
}

Write-Host "[3/9] Descobrindo a superfície operacional do PWA pelo service worker..."
$swPath = Join-Path $SourceDir "sw.js"
if (-not (Test-Path $swPath)) { throw "sw.js não encontrado no commit fonte." }
$sw = Get-Content $swPath -Raw
$matches = [regex]::Matches($sw, "'\./([^']+)'")
$frontendFiles = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($m in $matches) {
  $raw = $m.Groups[1].Value
  if ([string]::IsNullOrWhiteSpace($raw)) { continue }
  $pathOnly = ($raw -split '\?')[0]
  if (-not [string]::IsNullOrWhiteSpace($pathOnly)) { [void]$frontendFiles.Add($pathOnly) }
}
foreach ($required in @("index.html","base-v013.html","sw.js","manifest.webmanifest","VERSION")) {
  [void]$frontendFiles.Add($required)
}

New-Item -ItemType Directory -Path $BaselineDir -Force | Out-Null
$missing = New-Object System.Collections.Generic.List[string]
foreach ($relative in ($frontendFiles | Sort-Object)) {
  $src = Join-Path $SourceDir ($relative -replace '/', '\')
  $dst = Join-Path $BaselineDir ($relative -replace '/', '\')
  if (-not (Test-Path $src -PathType Leaf)) {
    $missing.Add($relative)
    continue
  }
  New-Item -ItemType Directory -Path (Split-Path $dst -Parent) -Force | Out-Null
  Copy-Item -LiteralPath $src -Destination $dst -Force
}
if ($missing.Count -gt 0) {
  $missing | Set-Content -Path (Join-Path $ArtifactDir "missing-app-shell-files.txt") -Encoding UTF8
  throw "Há arquivos referenciados pelo service worker que não existem no commit. Consulte missing-app-shell-files.txt."
}
$frontendFiles | Sort-Object | Set-Content -Path (Join-Path $ArtifactDir "frontend-operational-files.txt") -Encoding UTF8

Write-Host "[4/9] Copiando somente o backend versionado atual..."
$functionsSource = Join-Path $SourceDir "supabase\functions"
if (-not (Test-Path $functionsSource -PathType Container)) { throw "supabase/functions não encontrado." }
New-Item -ItemType Directory -Path (Join-Path $BaselineDir "supabase") -Force | Out-Null
Copy-Item -LiteralPath $functionsSource -Destination (Join-Path $BaselineDir "supabase\functions") -Recurse -Force

Write-Host "[5/9] Aplicando overlay sanitizado do webhook Meta SOMENTE ao baseline novo..."
$overlayRel = "supabase/functions/rota27-whatsapp-inbound/index.ts"
& git -C $SourceDir cat-file -e "$SecurityOverlaySha^{commit}" 2>$null
if ($LASTEXITCODE -ne 0) {
  throw "Commit de overlay de segurança não encontrado no clone: $SecurityOverlaySha"
}
Run-Git $SourceDir @("checkout", $SecurityOverlaySha, "--", $overlayRel)
$overlaySource = Join-Path $SourceDir ($overlayRel -replace '/', '\')
$overlayTarget = Join-Path $BaselineDir ($overlayRel -replace '/', '\')
if (-not (Test-Path $overlaySource -PathType Leaf)) { throw "Arquivo de overlay sanitizado não encontrado." }
Copy-Item -LiteralPath $overlaySource -Destination $overlayTarget -Force

$overlayText = Get-Content $overlayTarget -Raw
if ($overlayText -match 'rota27-whatsapp-inbound-verify-v1-20260823' -or $overlayText -match 'DEFAULT_VERIFY_TOKEN') {
  throw "Overlay de segurança inválido: fallback hardcoded do verify token ainda presente."
}
if ($overlayText -notmatch 'Deno\.env\.get\("META_WEBHOOK_VERIFY_TOKEN"\)' -or $overlayText -notmatch 'Deno\.env\.get\("META_APP_SECRET"\)') {
  throw "Overlay de segurança inválido: variáveis Meta obrigatórias não encontradas."
}
@(
  "production_source_sha=$SourceSha",
  "security_overlay_sha=$SecurityOverlaySha",
  "security_overlay_path=$overlayRel",
  "production_runtime_changed=false"
) | Set-Content -Path (Join-Path $ArtifactDir "security-overlay-verification.txt") -Encoding UTF8

New-Item -ItemType Directory -Path (Join-Path $BaselineDir "supabase\migrations") -Force | Out-Null
@'
# Nova linha de migrations

Este baseline parte do banco Supabase já existente. As migrations históricas permanecem preservadas no repositório legado e no backup Git integral.

Não reproduza as migrations antigas automaticamente neste repositório. Novas migrations, posteriores ao corte, devem começar aqui e ser revisadas antes de aplicação.
'@ | Set-Content -Path (Join-Path $BaselineDir "supabase\migrations\README.md") -Encoding UTF8

Write-Host "[6/9] Criando documentação, configuração Azure e políticas de secrets..."
@'
.env
.env.*
!.env.example
*.pem
*.key
*.pfx
*.p12
*.dump
*.sql
*.sql.gz
*.backup
node_modules/
.DS_Store
Thumbs.db
'@ | Set-Content -Path (Join-Path $BaselineDir ".gitignore") -Encoding UTF8

$readme = @"
# Rota 27 — Private Baseline

Baseline operacional sanitizado para a migração GitHub Pages → Azure.

## Origem verificável

- Frontend e backend-base: `AutomatrixHub/rota27` em `$SourceSha`
- Overlay de segurança do webhook Meta: `$SecurityOverlaySha`
- Data do corte: 2026-09-09
- Histórico completo preservado separadamente em `rota27-history-20260909.bundle`.

## Segurança do webhook Meta

O `main` legado ainda contém o verify token histórico hardcoded porque a produção antiga não pode ser alterada antes da rotação coordenada com a Meta. Este repositório privado NÃO herda esse fallback: o arquivo `supabase/functions/rota27-whatsapp-inbound/index.ts` é sobreposto pela versão sanitizada da PR de segurança antes do primeiro commit.

Essa sobreposição é somente de código no baseline. Ela NÃO significa deploy da Edge Function. O deploy continua bloqueado até `META_APP_SECRET` e `META_WEBHOOK_VERIFY_TOKEN` estarem configurados de forma coordenada.

## Regra principal

Este repositório nasce com histórico novo. O PWA é copiado a partir da lista de arquivos utilizada pelo `sw.js` do commit fonte. O backend parte somente de `supabase/functions` atualmente versionado, com o overlay de segurança descrito acima.

Secrets não pertencem ao Git. Devem ser configurados no ambiente de hospedagem/Supabase/Azure.

## Banco de dados

O projeto continua usando o mesmo Supabase durante a migração. O backup lógico oficial deve ser feito separadamente antes do corte definitivo. As migrations históricas não são reaplicadas neste baseline.

## Azure

`staticwebapp.config.json` é incluído no root para preservar atualização do Service Worker e evitar cache prolongado dos pontos de entrada. O hostname `*.azurestaticapps.net` é apenas para homologação técnica. O primeiro PWA operacional deve ser instalado diretamente no domínio final `https://rota27.automatrixhub.com.br`.
"@
Set-Content -Path (Join-Path $BaselineDir "README.md") -Value $readme -Encoding UTF8

$azureConfigSource = Join-Path $PSScriptRoot "azure\staticwebapp.config.json"
if (-not (Test-Path $azureConfigSource -PathType Leaf)) {
  throw "Configuração Azure não encontrada: $azureConfigSource"
}
Copy-Item -LiteralPath $azureConfigSource -Destination (Join-Path $BaselineDir "staticwebapp.config.json") -Force

# Copia apenas o kit de migração atual para o novo histórico sanitizado.
$opsDir = Join-Path $BaselineDir "ops\migration"
New-Item -ItemType Directory -Path $opsDir -Force | Out-Null
foreach ($name in @(
  "build-private-baseline.ps1",
  "backup-supabase-postgres.ps1",
  "provision-azure-preview.ps1",
  "prepare-azure-custom-domain.ps1"
)) {
  $src = Join-Path $PSScriptRoot $name
  if (Test-Path $src -PathType Leaf) { Copy-Item -LiteralPath $src -Destination (Join-Path $opsDir $name) -Force }
}

$docsSource = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\docs"))
$docsTarget = Join-Path $BaselineDir "docs\migration"
New-Item -ItemType Directory -Path $docsTarget -Force | Out-Null
foreach ($name in @("PRIVATE-BASELINE-MIGRATION-v1.md","PWA-PILOT-CUTOVER-RUNBOOK-v1.md")) {
  $src = Join-Path $docsSource $name
  if (Test-Path $src -PathType Leaf) { Copy-Item -LiteralPath $src -Destination (Join-Path $docsTarget $name) -Force }
}

$manifest = @()
$manifest += "source_sha=$SourceSha"
$manifest += "security_overlay_sha=$SecurityOverlaySha"
$manifest += "security_overlay_path=$overlayRel"
$manifest += "bundle_sha256=$BundleHash"
$manifest += "created_at=$([DateTimeOffset]::Now.ToString('o'))"
$manifest += "frontend_file_count=$($frontendFiles.Count)"
$manifest += "backend_source=supabase/functions"
$manifest += "azure_config=staticwebapp.config.json"
Set-Content -Path (Join-Path $BaselineDir "MIGRATION-BASELINE.txt") -Value $manifest -Encoding UTF8

Write-Host "[7/9] Executando varredura anti-secret..."
$blockedExtensions = @(".pem", ".key", ".pfx", ".p12", ".dump", ".backup")
$badFiles = Get-ChildItem $BaselineDir -Recurse -File | Where-Object { $blockedExtensions -contains $_.Extension.ToLowerInvariant() }
if ($badFiles) { throw "Arquivos sensíveis por extensão detectados no baseline." }

$secretPatterns = @(
  '-----BEGIN [A-Z ]*PRIVATE KEY-----',
  '(?i)\bEAA[A-Za-z0-9_-]{30,}\b',
  '(?i)\bsb_secret_[A-Za-z0-9_-]{20,}\b',
  '\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b',
  'rota27-whatsapp-inbound-verify-v1-20260823'
)
$textExtensions = @(".js", ".css", ".html", ".ts", ".md", ".txt", ".json", ".webmanifest", ".ps1")
$hits = New-Object System.Collections.Generic.List[string]
foreach ($file in Get-ChildItem $BaselineDir -Recurse -File) {
  if (-not ($textExtensions -contains $file.Extension.ToLowerInvariant())) { continue }
  if ($file.Length -gt 5MB) { continue }
  $text = $null
  try { $text = Get-Content $file.FullName -Raw -ErrorAction Stop } catch { continue }
  foreach ($pattern in $secretPatterns) {
    if ($text -match $pattern) {
      $hits.Add($file.FullName.Substring($BaselineDir.Length).TrimStart('\'))
      break
    }
  }
}
if ($hits.Count -gt 0) {
  $hits | Sort-Object -Unique | Set-Content -Path (Join-Path $ArtifactDir "secret-scan-hits.txt") -Encoding UTF8
  throw "A varredura encontrou padrões com aparência de secret. Nenhum push deve ser feito; revise secret-scan-hits.txt."
}

# Defesa adicional para os nomes de secrets críticos: permite referências a Deno.env/variáveis,
# mas bloqueia o literal histórico conhecido e JWT/tokens com aparência de credencial.
$criticalNames = @(
  "SUPABASE_SERVICE_ROLE_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "META_APP_SECRET",
  "ROTA27_DEVICE_TOKEN",
  "META_WEBHOOK_VERIFY_TOKEN"
)
$criticalNames | Set-Content -Path (Join-Path $ArtifactDir "critical-secret-names-audited.txt") -Encoding UTF8

Write-Host "[8/9] Criando novo histórico Git com root commit..."
Run-Git $BaselineDir @("init")
Run-Git $BaselineDir @("add", ".")
Push-Location $BaselineDir
try {
  & git -c user.name="Rota 27 Migration" -c user.email="migration@local.invalid" commit -m "Rota 27 private sanitized baseline from $SourceSha"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao criar root commit do baseline." }
  & git branch -M main
  if ($LASTEXITCODE -ne 0) { throw "Falha ao definir branch main." }
} finally { Pop-Location }
$RootSha = (& git -C $BaselineDir rev-parse HEAD).Trim()
$FileCount = (Get-ChildItem $BaselineDir -Recurse -File | Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }).Count

@(
  "source_sha=$SourceSha",
  "security_overlay_sha=$SecurityOverlaySha",
  "baseline_root_sha=$RootSha",
  "bundle_sha256=$BundleHash",
  "baseline_file_count=$FileCount"
) | Set-Content -Path (Join-Path $ArtifactDir "baseline-verification.txt") -Encoding UTF8

Write-Host "[9/9] Finalização..."
if ($CreatePrivateRepo) {
  if ([string]::IsNullOrWhiteSpace($PrivateRepo)) {
    throw "Use -PrivateRepo owner/nome junto com -CreatePrivateRepo."
  }
  Require-Command gh
  & gh auth status
  if ($LASTEXITCODE -ne 0) { throw "GitHub CLI não está autenticado. Execute gh auth login e rode novamente." }
  & gh repo view $PrivateRepo *> $null
  if ($LASTEXITCODE -eq 0) { throw "O repositório $PrivateRepo já existe. Criação automática abortada para evitar sobrescrita." }
  Push-Location $BaselineDir
  try {
    & gh repo create $PrivateRepo --private --source . --remote origin --push
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar/pushar o repositório privado." }
  } finally { Pop-Location }
}

Write-Host ""
Write-Host "Baseline sanitizado concluído." -ForegroundColor Green
Write-Host "Fonte produção: $SourceSha"
Write-Host "Overlay seguro: $SecurityOverlaySha"
Write-Host "Root novo:      $RootSha"
Write-Host "Bundle SHA:     $BundleHash"
Write-Host "Arquivos:       $FileCount"
Write-Host "Pasta:          $DestinationRoot"
if (-not $CreatePrivateRepo) {
  Write-Host "O repositório privado NÃO foi criado automaticamente."
  Write-Host "Para publicar depois, entre em '$BaselineDir' e execute:"
  Write-Host "  gh repo create OWNER/NOME --private --source . --remote origin --push"
}
