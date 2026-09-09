param(
  [string]$DatabaseHost = "db.owkvwsiblbzlpxjwybrt.supabase.co",
  [int]$Port = 5432,
  [string]$Database = "postgres",
  [string]$User = "postgres",
  [string]$OutputDir = (Join-Path (Get-Location) "ROTA27-DB-BACKUP-20260909"),
  [switch]$ForceDocker
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Comando obrigatório não encontrado: $Name"
  }
}

if (Test-Path $OutputDir) {
  throw "O diretório de backup já existe: $OutputDir. Escolha outro caminho para evitar sobrescrita."
}
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null

$secure = Read-Host "Senha do banco Supabase (não será exibida nem gravada)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrWhiteSpace($plainPassword)) { throw "Senha vazia." }

$previousPgPassword = $env:PGPASSWORD
$env:PGPASSWORD = $plainPassword
$plainPassword = $null

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$dumpName = "rota27-$stamp.dump"
$schemaName = "rota27-$stamp-schema.sql"
$dumpPath = Join-Path $OutputDir $dumpName
$schemaPath = Join-Path $OutputDir $schemaName
$manifestPath = Join-Path $OutputDir "backup-manifest.json"

$useDocker = $ForceDocker.IsPresent
if (-not $useDocker) {
  $pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
  $pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
  if (-not $pgDump -or -not $pgRestore) { $useDocker = $true }
}

try {
  if ($useDocker) {
    Require-Command docker
    Write-Host "Usando postgres:17-alpine via Docker."
    & docker pull postgres:17-alpine
    if ($LASTEXITCODE -ne 0) { throw "Falha ao obter imagem postgres:17-alpine." }

    $mount = (Resolve-Path $OutputDir).Path
    & docker run --rm --env PGPASSWORD -v "${mount}:/backup" postgres:17-alpine `
      pg_dump -h $DatabaseHost -p $Port -U $User -d $Database --format=custom --compress=9 --no-owner --no-privileges -f "/backup/$dumpName"
    if ($LASTEXITCODE -ne 0) { throw "pg_dump custom falhou." }

    & docker run --rm --env PGPASSWORD -v "${mount}:/backup" postgres:17-alpine `
      pg_dump -h $DatabaseHost -p $Port -U $User -d $Database --schema-only --no-owner --no-privileges -f "/backup/$schemaName"
    if ($LASTEXITCODE -ne 0) { throw "pg_dump schema-only falhou." }

    & docker run --rm -v "${mount}:/backup" postgres:17-alpine pg_restore --list "/backup/$dumpName" *> (Join-Path $OutputDir "pg-restore-list.txt")
    if ($LASTEXITCODE -ne 0) { throw "pg_restore --list falhou; dump não validado." }
  } else {
    Write-Host "Usando pg_dump/pg_restore locais."
    & pg_dump -h $DatabaseHost -p $Port -U $User -d $Database --format=custom --compress=9 --no-owner --no-privileges -f $dumpPath
    if ($LASTEXITCODE -ne 0) { throw "pg_dump custom falhou." }

    & pg_dump -h $DatabaseHost -p $Port -U $User -d $Database --schema-only --no-owner --no-privileges -f $schemaPath
    if ($LASTEXITCODE -ne 0) { throw "pg_dump schema-only falhou." }

    & pg_restore --list $dumpPath *> (Join-Path $OutputDir "pg-restore-list.txt")
    if ($LASTEXITCODE -ne 0) { throw "pg_restore --list falhou; dump não validado." }
  }

  if (-not (Test-Path $dumpPath -PathType Leaf)) { throw "Arquivo .dump não foi criado." }
  if (-not (Test-Path $schemaPath -PathType Leaf)) { throw "Arquivo schema.sql não foi criado." }

  $dumpInfo = Get-Item $dumpPath
  $schemaInfo = Get-Item $schemaPath
  $dumpHash = (Get-FileHash -Algorithm SHA256 $dumpPath).Hash.ToLowerInvariant()
  $schemaHash = (Get-FileHash -Algorithm SHA256 $schemaPath).Hash.ToLowerInvariant()

  $manifest = [ordered]@{
    created_at = [DateTimeOffset]::Now.ToString("o")
    project_ref = "owkvwsiblbzlpxjwybrt"
    region = "sa-east-1"
    postgres_major = 17
    database_host = $DatabaseHost
    database = $Database
    user = $User
    dump_file = $dumpName
    dump_bytes = $dumpInfo.Length
    dump_sha256 = $dumpHash
    schema_file = $schemaName
    schema_bytes = $schemaInfo.Length
    schema_sha256 = $schemaHash
    restore_list_file = "pg-restore-list.txt"
    password_recorded = $false
  }
  $manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $manifestPath -Encoding UTF8

  @(
    "$dumpHash  $dumpName",
    "$schemaHash  $schemaName"
  ) | Set-Content -Path (Join-Path $OutputDir "SHA256SUMS.txt") -Encoding UTF8

  Write-Host ""
  Write-Host "Backup concluído e validado." -ForegroundColor Green
  Write-Host "Dump:    $dumpPath"
  Write-Host "Schema:  $schemaPath"
  Write-Host "Manifest:$manifestPath"
  Write-Host "SHA256:  $dumpHash"
  Write-Host ""
  Write-Host "IMPORTANTE: mantenha esta pasta fora do Git e em armazenamento seguro."
} finally {
  if ($null -eq $previousPgPassword) { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
  else { $env:PGPASSWORD = $previousPgPassword }
}
