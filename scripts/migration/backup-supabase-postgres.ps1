param(
  [string]$ProjectRef = "owkvwsiblbzlpxjwybrt",
  [string]$OutputDir = (Join-Path (Join-Path ([Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)) "Rota27\Backups") ("ROTA27-DB-BACKUP-" + (Get-Date -Format "yyyyMMdd-HHmmss")))
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

function Assert-OutsideCurrentGitWorktree([string]$Path) {
  $root = $null
  try {
    $root = ((& git rev-parse --show-toplevel 2>$null) | Out-String).Trim()
  } catch {}
  if (-not $root) { return }
  $rootFull = [IO.Path]::GetFullPath($root).TrimEnd('\','/')
  $outFull = [IO.Path]::GetFullPath($Path).TrimEnd('\','/')
  $prefix = $rootFull + [IO.Path]::DirectorySeparatorChar
  if ($outFull.Equals($rootFull,[StringComparison]::OrdinalIgnoreCase) -or $outFull.StartsWith($prefix,[StringComparison]::OrdinalIgnoreCase)) {
    throw "Por segurança, o backup não pode ser criado dentro do repositório Git atual: $rootFull. Use uma pasta local fora do Git."
  }
}

function Parse-And-ValidateDbTarget([string]$Url,[string]$ExpectedProjectRef) {
  if ([string]::IsNullOrWhiteSpace($Url)) { throw "Connection string vazia." }
  if ($Url -match '\s') { throw "A connection string contém espaço. Percent-encode caracteres reservados da senha antes de continuar." }
  if ($Url -notmatch '^postgres(ql)?://') { throw "A connection string deve começar com postgres:// ou postgresql://." }

  try { $uri = [Uri]$Url } catch { throw "Connection string inválida. Copie novamente do painel Connect e percent-encode caracteres reservados da senha." }
  if ($uri.Port -ne 5432) { throw "Use porta 5432: Session Pooler ou conexão direta. Porta detectada: $($uri.Port)." }
  if ($uri.AbsolutePath.TrimEnd('/') -ne '/postgres') { throw "O banco de destino deve ser /postgres. Caminho detectado: $($uri.AbsolutePath)" }

  $host = String($uri.Host).ToLowerInvariant()
  $userEncoded = (($uri.UserInfo -split ':',2)[0])
  $user = [Uri]::UnescapeDataString($userEncoded)
  $expectedDirect = "db.$ExpectedProjectRef.supabase.co"
  $expectedPoolerUser = "postgres.$ExpectedProjectRef"

  if ($host -eq $expectedDirect) {
    if ($user -ne 'postgres') { throw "Usuário inesperado para conexão direta. Esperado: postgres." }
    return [ordered]@{ mode='direct'; host=$host; port=$uri.Port; database='postgres' }
  }
  if ($host -like '*.pooler.supabase.com') {
    if ($user -ne $expectedPoolerUser) {
      throw "A connection string do Pooler não pertence ao projeto esperado. Usuário esperado: $expectedPoolerUser."
    }
    return [ordered]@{ mode='session_pooler'; host=$host; port=$uri.Port; database='postgres' }
  }
  throw "Host de banco inesperado: $host. Use a connection string do projeto $ExpectedProjectRef copiada do painel Supabase Connect."
}

Require-Command git
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
    $prefix = $CliArgs[0..([Math]::Min(1,$CliArgs.Count-1))] -join ' '
    throw "Supabase CLI falhou: $prefix"
  }
}

Assert-OutsideCurrentGitWorktree $OutputDir
if ($OutputDir -match '(?i)[\\/]OneDrive[\\/]') {
  Write-Warning "O destino parece estar dentro do OneDrive. O backup contém dados operacionais e uma tabela com token; prefira armazenamento local protegido e criptografado."
}
if (Test-Path $OutputDir) {
  throw "O diretório de backup já existe: $OutputDir. Escolha outro caminho para evitar sobrescrita."
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

Write-Host "Use a connection string copiada de Supabase Dashboard > Connect."
Write-Host "Preferência: Session Pooler na porta 5432; conexão direta também é aceita se sua rede suportar IPv6."
Write-Host "Percent-encode caracteres reservados da senha. A string será lida de forma oculta e não será gravada no manifesto."
$secure = Read-Host "Database connection string" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $dbUrl = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
$dbUrl = String($dbUrl).Trim()
$target = Parse-And-ValidateDbTarget $dbUrl $ProjectRef
Write-Host "Destino validado: projeto $ProjectRef • $($target.mode) • $($target.host):$($target.port)/$($target.database)" -ForegroundColor Green

$rolesPath         = Join-Path $OutputDir "roles.sql"
$schemaPath        = Join-Path $OutputDir "schema.sql"
$dataPath          = Join-Path $OutputDir "data.sql"
$historySchemaPath = Join-Path $OutputDir "history_schema.sql"
$historyDataPath   = Join-Path $OutputDir "history_data.sql"
$backupFiles       = @($rolesPath,$schemaPath,$dataPath,$historySchemaPath,$historyDataPath)

try {
  Write-Host "[1/8] Validando Docker..."
  & docker version *> $null
  if ($LASTEXITCODE -ne 0) { throw "Docker Desktop não está disponível/ativo." }

  Write-Host "[2/8] Confirmando suporte do Supabase CLI a db dump..."
  Invoke-SupabaseCli @("db","dump","--help")

  Write-Host "[3/8] Exportando roles..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$rolesPath,"--role-only")

  Write-Host "[4/8] Exportando schema..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$schemaPath)

  Write-Host "[5/8] Exportando dados..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$dataPath,"--use-copy","--data-only","-x","storage.buckets_vectors","-x","storage.vector_indexes")

  Write-Host "[6/8] Exportando histórico de migrations..."
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$historySchemaPath,"--schema","supabase_migrations")
  Invoke-SupabaseCli @("db","dump","--db-url",$dbUrl,"-f",$historyDataPath,"--use-copy","--data-only","--schema","supabase_migrations")

  Write-Host "[7/8] Validando conteúdo mínimo dos dumps..."
  foreach ($path in $backupFiles) {
    if (-not (Test-Path $path -PathType Leaf)) { throw "Arquivo esperado não criado: $path" }
    if ((Get-Item $path).Length -le 0) { throw "Arquivo de backup vazio: $path" }
  }

  $schemaText = Get-Content $schemaPath -Raw
  foreach ($table in @('rota27_sync_events','rota27_sync_devices','whatsapp_message_log','rota27_automation_credentials')) {
    if ($schemaText -notmatch [regex]::Escape($table)) { throw "schema.sql não contém a tabela esperada: $table" }
  }
  $dataText = Get-Content $dataPath -Raw
  foreach ($table in @('rota27_sync_events','rota27_sync_devices','whatsapp_message_log','rota27_automation_credentials')) {
    if ($dataText -notmatch [regex]::Escape($table)) { throw "data.sql não contém referência à tabela esperada: $table" }
  }
  $historyText = (Get-Content $historySchemaPath -Raw) + "`n" + (Get-Content $historyDataPath -Raw)
  if ($historyText -notmatch 'schema_migrations') { throw "Backup do histórico não contém supabase_migrations.schema_migrations." }

  Write-Host "[8/8] Calculando hashes e manifesto..."
  $files = @()
  foreach ($path in $backupFiles) {
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
    validated_target_mode = $target.mode
    validated_target_host = $target.host
    validated_target_port = $target.port
    validated_database = $target.database
    region_at_preflight = "sa-east-1"
    postgres_engine_at_preflight = "17"
    source_status_at_preflight = "ACTIVE_HEALTHY"
    storage_bucket_count_at_preflight = 0
    storage_object_count_at_preflight = 0
    method = "Supabase CLI db dump"
    supabase_cli_version = $cliVersion
    database_url_recorded = $false
    contains_operational_data = $true
    contains_credential_table = $true
    credential_table = "public.rota27_automation_credentials"
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
- history_schema.sql
- history_data.sql
- backup-manifest.json
- SHA256SUMS.txt

IMPORTANTE — CONTEÚDO SENSÍVEL:
- data.sql contém dados operacionais reais.
- public.rota27_automation_credentials possui uma coluna token; portanto o backup deve ser tratado como credencial sensível.
- não colocar esta pasta em Git, anexo de chat, e-mail ou armazenamento compartilhado sem criptografia apropriada.
- o destino padrão fica em LocalApplicationData, fora do repositório e fora do fluxo normal de documentos sincronizados.
- a connection string usada na execução não é gravada no manifesto.

Preflight de 09/09/2026:
- Supabase Storage: 0 buckets / 0 objetos.
- Vault: 0 secrets.
- customizações em auth/storage não foram encontradas no histórico de migrations; validar novamente antes de uma restauração definitiva.

Antes do cutover Azure, testar restauração em ambiente isolado conforme documentação oficial do Supabase.
'@ | Set-Content -Path (Join-Path $OutputDir "LEIA-ME.txt") -Encoding UTF8

  Write-Host ""
  Write-Host "Backup lógico concluído." -ForegroundColor Green
  Write-Host "Pasta: $OutputDir"
  Write-Host "Hashes: $(Join-Path $OutputDir 'SHA256SUMS.txt')"
  Write-Host "ATENÇÃO: data.sql é sensível e contém a tabela de credencial de automação." -ForegroundColor Yellow
  Write-Host "A connection string não foi gravada."
} finally {
  $dbUrl = $null
}
