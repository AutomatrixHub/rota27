param(
  [string]$ProjectRef = "owkvwsiblbzlpxjwybrt",
  [string]$OutputDir = (Join-Path (Get-Location) "ROTA27-DB-BACKUP-20260909")
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

$useInstalledCli = [bool](Get-Command supabase -ErrorAction SilentlyContinue)
if (-not $useInstalledCli) { Require-Command npx }
Require-Command docker

function Invoke-SupabaseCli([string[]]$CliArgs) {
  if ($useInstalledCli) {
    & supabase @CliArgs
  } else {
    & npx --yes supabase@latest @CliArgs
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase CLI falhou: $($CliArgs[0..([Math]::Min(1,$CliArgs.Count-1))] -join ' ')"
  }
}

if (Test-Path $OutputDir) {
  throw "O diretório de backup já existe: $OutputDir. Escolha outro caminho para evitar sobrescrita."
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

Write-Host "Use a CONNECTION STRING do modo Session Pooler obtida em Supabase Dashboard > Connect."
Write-Host "A string será lida de forma oculta e não será gravada nos arquivos de manifesto."
$secure = Read-Host "Session Pooler connection string" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $dbUrl = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrWhiteSpace($dbUrl)) { throw "Connection string vazia." }
if ($dbUrl -notmatch '^postgres(ql)?://') { throw "A connection string deve começar com postgres:// ou postgresql://." }
if ($dbUrl -notmatch ':5432/') { Write-Warning "A URL não parece usar a porta 5432 do Session Pooler. Confirme no Dashboard antes de prosseguir." }

$rolesPath  = Join-Path $OutputDir "roles.sql"
$schemaPath = Join-Path $OutputDir "schema.sql"
$dataPath   = Join-Path $OutputDir "data.sql"

try {
  Write-Host "[1/5] Validando Docker..."
  & docker version *> $null
  if ($LASTEXITCODE -ne 0) { throw "Docker Desktop não está disponível/ativo." }

  Write-Host "[2/5] Exportando roles..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$rolesPath,"--role-only")

  Write-Host "[3/5] Exportando schema..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$schemaPath)

  Write-Host "[4/5] Exportando dados..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$dataPath,"--use-copy","--data-only","-x","storage.buckets_vectors","-x","storage.vector_indexes")

  foreach ($path in @($rolesPath,$schemaPath,$dataPath)) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "Arquivo esperado não criado: $path" }
    if ((Get-Item $path).Length -le 0) { throw "Arquivo de backup vazio: $path" }
  }

  Write-Host "[5/5] Calculando hashes e manifesto..."
  $files = @()
  foreach ($path in @($rolesPath,$schemaPath,$dataPath)) {
    $item = Get-Item $path
    $hash = (Get-FileHash -Algorithm SHA256 $path).Hash.ToLowerInvariant()
    $files += [ordered]@{
      name = $item.Name
      bytes = $item.Length
      sha256 = $hash
    }
  }

  $cliVersion = "unknown"
  try {
    if ($useInstalledCli) { $cliVersion = ((& supabase --version) | Out-String).Trim() }
    else { $cliVersion = ((& npx --yes supabase@latest --version) | Out-String).Trim() }
  } catch {}

  $manifest = [ordered]@{
    created_at = [DateTimeOffset]::Now.ToString("o")
    project_ref = $ProjectRef
    region = "sa-east-1"
    postgres_engine = "17"
    source_status_at_preflight = "ACTIVE_HEALTHY"
    method = "Supabase CLI db dump"
    connection_mode_expected = "Session Pooler 5432"
    supabase_cli_version = $cliVersion
    database_url_recorded = $false
    files = $files
    restore_note = "Restore deve seguir a documentação oficial Supabase e ser validado em ambiente isolado antes de qualquer cutover."
  }
  $manifest | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $OutputDir "backup-manifest.json") -Encoding UTF8

  $sumLines = $files | ForEach-Object { "$($_.sha256)  $($_.name)" }
  $sumLines | Set-Content -Path (Join-Path $OutputDir "SHA256SUMS.txt") -Encoding UTF8

  @'
Rota 27 — backup lógico Supabase

Arquivos:
- roles.sql
- schema.sql
- data.sql
- backup-manifest.json
- SHA256SUMS.txt

IMPORTANTE:
- Esta pasta contém dados operacionais e deve ficar fora do Git.
- Não enviar estes arquivos para o repositório público ou privado.
- Antes do cutover Azure, testar uma restauração em ambiente isolado conforme documentação oficial do Supabase.
'@ | Set-Content -Path (Join-Path $OutputDir "LEIA-ME.txt") -Encoding UTF8

  Write-Host ""
  Write-Host "Backup lógico concluído." -ForegroundColor Green
  Write-Host "Pasta: $OutputDir"
  Write-Host "Hashes: $(Join-Path $OutputDir 'SHA256SUMS.txt')"
  Write-Host "A connection string não foi gravada."
} finally {
  $dbUrl = $null
}
