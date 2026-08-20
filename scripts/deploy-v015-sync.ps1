$ErrorActionPreference = 'Stop'

$ProjectRef = 'owkvwsiblbzlpxjwybrt'
$ExpectedBranch = 'feature/v0.15-multidispositivo'
$FunctionName = 'rota27-sync'

Write-Host ''
Write-Host 'Rota 27 v0.15 DEV.1 - Deploy controlado do backend de sincronizacao' -ForegroundColor Cyan
Write-Host 'Projeto Supabase:' $ProjectRef
Write-Host ''

$branch = (git branch --show-current).Trim()
if ($branch -ne $ExpectedBranch) {
    throw "Branch incorreta. Esperado: $ExpectedBranch | Atual: $branch"
}

Write-Host '1/5 - Verificando Supabase CLI...' -ForegroundColor Yellow
npx --yes supabase@latest --version

Write-Host ''
Write-Host '2/5 - Vinculando ao projeto remoto...' -ForegroundColor Yellow
Write-Host 'Se a CLI pedir autenticacao, conclua o login no fluxo oficial do Supabase.'
npx --yes supabase@latest link --project-ref $ProjectRef

Write-Host ''
Write-Host '3/5 - Conferindo historico de migrations...' -ForegroundColor Yellow
npx --yes supabase@latest migration list

Write-Host ''
Write-Host '4/5 - Dry-run: NENHUMA alteracao sera aplicada nesta etapa.' -ForegroundColor Yellow
npx --yes supabase@latest db push --dry-run

Write-Host ''
Write-Host 'Revise acima quais migrations serao aplicadas.' -ForegroundColor Magenta
$confirmation = Read-Host 'Para aplicar a migration e publicar a Edge Function, digite exatamente PUBLICAR'
if ($confirmation -cne 'PUBLICAR') {
    Write-Host 'Deploy cancelado. Nenhuma migration nova foi aplicada por este script.' -ForegroundColor Yellow
    exit 0
}

Write-Host ''
Write-Host 'Aplicando migrations pendentes...' -ForegroundColor Yellow
npx --yes supabase@latest db push

Write-Host ''
Write-Host '5/5 - Publicando Edge Function com Verify JWT OFF...' -ForegroundColor Yellow
npx --yes supabase@latest functions deploy $FunctionName --project-ref $ProjectRef --no-verify-jwt

Write-Host ''
Write-Host 'Deploy concluido.' -ForegroundColor Green
Write-Host "Endpoint esperado: https://$ProjectRef.supabase.co/functions/v1/$FunctionName"
Write-Host 'O secret ROTA27_DEVICE_TOKEN ja deve existir no projeto. Nao cole o valor dele no terminal/chat sem necessidade.' -ForegroundColor DarkYellow
