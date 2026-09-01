# Rota 27 v0.25.95 — Fronteira segura Modo Teste → Dados Reais

## Problema observado
Após permanecer no Modo Teste e usar **Voltar aos dados reais**, a tela Comandas/Lista podia voltar à paleta real mantendo temporariamente as quatro comandas abertas geradas pelo sandbox (`test_open_*`).

## Diagnóstico
- o Modo Teste virtualiza as chaves operacionais do `localStorage`, portanto a base real permanece preservada;
- as comandas abertas fictícias são geradas em memória com `testMode:true` e IDs `test_open_1...4`;
- na saída do sandbox, camadas de UI podiam renderizar `state.commands` ainda fictício antes de a aplicação ser completamente reidratada;
- investigação em `rota27_sync_events` não encontrou as quatro comandas da captura como comandas abertas reais no backend. Os clientes usados pelo cenário existem na base real, mas as ocorrências reais encontradas estavam fechadas e com outros locais/valores.

## Correção
Nova barreira `assets/v02595-test-real-boundary.js`:
1. detecta a transição `rota27:test-mode-changed` para `active:false`;
2. bloqueia temporariamente chamadas ao `rota27-sync` durante a fronteira de restauração;
3. remove imediatamente cards/objetos `test_open_*` da memória e da UI transitória;
4. marca a transição em `sessionStorage`;
5. executa um único reload controlado, reidratando todas as camadas exclusivamente do `localStorage` real preservado;
6. no boot, se detectar artefato de teste fora do Modo Teste, executa a mesma recuperação antes de permitir sincronização.

## Segurança de dados
- nenhuma migration;
- nenhuma exclusão de comandas reais;
- nenhum evento histórico apagado;
- nenhuma alteração em Supabase;
- nenhuma alteração em WhatsApp;
- `rota27-sync` permanece inalterado.

## PWA
- VERSION: `0.25.95`
- cache: `rota27-comandas-v0.25.95-r1`
- Ajuda: v11.0

## Validação esperada
1. Ativar Modo Teste e confirmar as quatro comandas fictícias.
2. Usar **Voltar aos dados reais**.
3. A aplicação deve fazer uma única recarga controlada.
4. Após a recarga, Comandas deve refletir somente o estado real sincronizado.
5. Nenhum `test_open_*` pode permanecer visível ou ser enviado ao backend.

## Rollback
Baseline anterior: v0.25.94 / merge `58363d185635860251279acafa39627caa7a4ded`.
