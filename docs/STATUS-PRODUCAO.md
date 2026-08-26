# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.9 — Limpeza de Produção & Referência de Categoria**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.9-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.8 — Replay Hibernado**.

## v0.25.9 — limpeza controlada da comanda de teste
Comanda removida:

`c1787598217117` — **Mamute / Mesa 1 / R$ 22,00 / 24/08/2026**.

### Supabase
Foram executadas correções diretamente nos dados:
- removidos os 3 eventos da comanda (`command_opened`, `item_delta`, `command_closed`);
- removidos 2 `client_upsert` gerados especificamente pela abertura/fechamento do teste;
- removidos os registros de `whatsapp_message_log` dessa comanda;
- corrigido `turn_closed_2026-08-24`, preservando o fechamento e mantendo `cancelled=1` e `auditEvents=5`, mas com `revenue=0`, `closedCount=0`, `avgTicket=0`, `units=0`, `products=[]` e `payments=[]`.

Verificação pós-limpeza confirmou zero referências remotas para o ID da comanda nos eventos e no log de WhatsApp.

### Aparelhos
A release inclui uma limpeza local idempotente que:
- remove a comanda de `state.commands`/`state.history`;
- limpa outboxes relacionadas;
- corrige o `lastSeenAt` local do cliente com base nas comandas restantes;
- corrige o fechamento local de 24/08 quando ele corresponde exatamente ao resumo contaminado;
- repete a proteção no startup, após a sincronização inicial, ao voltar online e ao retornar à tela, sem polling.

## Categorias — referência somente leitura
Ao editar uma categoria, aparece uma lista de referência com os produtos daquela categoria:
- nome;
- preço;
- ativo/inativo.

A lista não possui ações. Produtos continuam sendo editados no Cardápio.

## WhatsApp
Permanece ativa a cópia fixa de novos lançamentos para `+55 27 99776-9279` (`5527997769279`).

O replay histórico de 25/08 continua hibernado e não aparece na interface.

## Backend e sincronização
A v0.25.9 não cria Edge Function, migration, tabela ou novo tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v6.0**, identificando Rota 27 v0.25.9.

## Atualização da PWA
Não reinstalar e não limpar dados. Em **cada aparelho**:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.9`;
6. sincronizar e verificar que a comanda Mamute/Mesa 1/R$ 22,00 não aparece mais.

Ver `docs/RELEASE-v0.25.9.md`.
