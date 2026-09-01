# Rota 27 v0.25.95 — Fronteira segura Modo Teste → Dados Reais

## Problema observado
Após permanecer no Modo Teste e usar **Voltar aos dados reais**, a tela Comandas/Lista podia voltar à paleta real mantendo temporariamente as quatro comandas abertas geradas pelo sandbox (`test_open_*`).

## Diagnóstico
- o Modo Teste virtualiza as chaves operacionais do `localStorage`, portanto a base real permanece preservada;
- as comandas abertas fictícias são geradas em memória com `testMode:true` e IDs `test_open_1...4`;
- na saída do sandbox, camadas de UI podiam renderizar `state.commands` ainda fictício antes de a aplicação ser completamente reidratada;
- a captura corresponde exatamente ao gerador do sandbox: Balcão, Mesa 3, Mesa 4 e Parklet 2;
- auditoria global em `rota27_sync_events` encontrou **zero** eventos com `entity_id/event_id test_*` ou payload `testMode:true`; portanto não houve contaminação da base real sincronizada.

## Correção
Nova barreira `assets/v02595-test-real-boundary.js`:
1. detecta a transição `rota27:test-mode-changed` para `active:false`;
2. bloqueia temporariamente tanto `save()` quanto chamadas ao `rota27-sync` durante a fronteira de restauração;
3. remove imediatamente cards/objetos `test_open_*` da memória e da UI transitória;
4. marca a transição em `sessionStorage`;
5. executa um único reload controlado, reidratando todas as camadas exclusivamente do `localStorage` real preservado;
6. no boot, se detectar artefato de teste fora do Modo Teste, executa a mesma recuperação antes de permitir persistência/sincronização.

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
