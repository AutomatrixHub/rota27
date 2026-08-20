$ErrorActionPreference = 'Stop'

$ProjectRef = 'owkvwsiblbzlpxjwybrt'
$ExpectedBranch = 'feature/v0.15-multidispositivo'
$FunctionName = 'rota27-lab'
$PinnedRevision = '59e5f2c4d530e0ff09474130383e9b3de20c4925'
$LabUrl = "https://$ProjectRef.supabase.co/functions/v1/$FunctionName/v015-preview.html?dev=2&lab=public&fix=021"
$HealthUrl = "https://$ProjectRef.supabase.co/functions/v1/$FunctionName/health"

function Assert-NativeSuccess([string]$Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step falhou (exit code $LASTEXITCODE). Publicacao do laboratorio interrompida."
    }
}

Write-Host ''
Write-Host 'Rota 27 v0.15 DEV.2.1 - Publicacao do laboratorio remoto isolado' -ForegroundColor Cyan
Write-Host 'Produção/main não será alterada.' -ForegroundColor Green
Write-Host ''

$branch = (git branch --show-current).Trim()
Assert-NativeSuccess 'Leitura da branch Git'
if ($branch -ne $ExpectedBranch) {
    throw "Branch incorreta. Esperado: $ExpectedBranch | Atual: $branch"
}

Write-Host '1/4 - Verificando Supabase CLI...' -ForegroundColor Yellow
npx --yes supabase@latest --version
Assert-NativeSuccess 'Verificacao da Supabase CLI'

Write-Host ''
Write-Host '2/4 - Confirmando acesso ao projeto Rota27...' -ForegroundColor Yellow
npx --yes supabase@latest projects list
Assert-NativeSuccess 'Listagem de projetos Supabase'

Write-Host ''
Write-Host '3/4 - Publicando SOMENTE a Edge Function rota27-lab...' -ForegroundColor Yellow
Write-Host "Build do app fixado no commit: $PinnedRevision"
Write-Host 'Nenhuma migration será executada.' -ForegroundColor DarkYellow
Write-Host 'A main/v0.14 e o GitHub Pages de produção permanecem intactos.' -ForegroundColor DarkYellow

npx --yes supabase@latest functions deploy $FunctionName --project-ref $ProjectRef --no-verify-jwt
Assert-NativeSuccess 'Deploy da Edge Function rota27-lab'

Write-Host ''
Write-Host '4/4 - Validando endpoint público do laboratório...' -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 20
    if (-not $health.ok) { throw 'Health check retornou ok=false.' }
    Write-Host ("Health OK | versão: {0} | revisão: {1}" -f $health.version, $health.revision) -ForegroundColor Green
} catch {
    throw "Deploy ocorreu, mas o health check falhou: $($_.Exception.Message)"
}

Write-Host ''
Write-Host 'LABORATÓRIO PÚBLICO PRONTO.' -ForegroundColor Green
Write-Host ''
Write-Host 'Abra esta URL no Android, em qualquer rede:' -ForegroundColor Cyan
Write-Host $LabUrl -ForegroundColor White
Write-Host ''
Write-Host 'Observações:' -ForegroundColor Yellow
Write-Host '- esta URL serve apenas a DEV.2.1 fixada no commit acima;'
Write-Host '- o laboratório não contém Device Token embutido; configure-o no aparelho;'
Write-Host '- não instale esta DEV por cima da PWA v0.14 de produção;'
Write-Host '- para futuras builds, o PINNED_REV da função deverá ser atualizado e a função republicada.'
