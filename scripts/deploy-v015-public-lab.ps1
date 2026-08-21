$ErrorActionPreference = 'Stop'

$ExpectedBranch = 'feature/v0.15-multidispositivo'
$PinnedRevision = '59e5f2c4d530e0ff09474130383e9b3de20c4925'
$LabUrl = "https://rawcdn.githack.com/AutomatrixHub/rota27/$PinnedRevision/v015-preview.html?dev=2&lab=public&fix=021"

function Assert-NativeSuccess([string]$Step) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Step falhou (exit code $LASTEXITCODE)."
    }
}

Write-Host ''
Write-Host 'Rota 27 v0.15 DEV.2.1 - Laboratorio publico isolado' -ForegroundColor Cyan
Write-Host 'Produção/main e GitHub Pages v0.14 não serão alterados.' -ForegroundColor Green
Write-Host ''

$branch = (git branch --show-current).Trim()
Assert-NativeSuccess 'Leitura da branch Git'
if ($branch -ne $ExpectedBranch) {
    throw "Branch incorreta. Esperado: $ExpectedBranch | Atual: $branch"
}

Write-Host 'Build fixado no commit:' -ForegroundColor Yellow
Write-Host $PinnedRevision -ForegroundColor White
Write-Host ''
Write-Host 'A Edge Function rota27-lab não é mais usada para servir HTML.' -ForegroundColor DarkYellow
Write-Host 'Motivo: Supabase Hosted Edge Functions converte text/html em text/plain sem custom domain.' -ForegroundColor DarkYellow
Write-Host ''
Write-Host 'LABORATORIO PUBLICO PRONTO PARA USO.' -ForegroundColor Green
Write-Host ''
Write-Host 'Abra esta URL no Android/iPhone, em qualquer rede:' -ForegroundColor Cyan
Write-Host $LabUrl -ForegroundColor White
Write-Host ''
Write-Host 'Observações:' -ForegroundColor Yellow
Write-Host '- o código está fixado na DEV.2.1 validada;'
Write-Host '- nenhum Device Token está embutido; configure-o localmente no aparelho;'
Write-Host '- a sincronização continua usando a Edge Function rota27-sync;'
Write-Host '- não instale esta DEV por cima da PWA v0.14 de produção;'
Write-Host '- o provedor de preview pode mostrar uma confirmação de segurança na primeira abertura de HTML.'
