# Gate de promoção — Rota 27 v0.25.16

## Escopo
Reparo histórico, idempotente e rastreável do fechamento relacionado à comanda `c1787690191876`, preservando a regra da v0.25.15 para novos fluxos.

## Gate de dados
- [x] comanda Fred confirmada no event log: abertura seq 397, fechamento seq 536;
- [x] recebível confirmado: seq 535, R$ 145,00, sem baixa fictícia;
- [x] fechamento inconsistente confirmado: seq 539, `businessDate = 2026-08-26`;
- [x] nenhum `turn_closed` de 25/08 existia antes do reparo;
- [x] reconstrução das 8 comandas abertas em 25/08 totaliza R$ 448,00 e 33 unidades;
- [x] pagamentos reconstruídos: A receber 145 + Pix 132 + Débito 104 + Crédito 67 = R$ 448,00.

## Gate de backend
- [x] migration `expand_rota27_sync_event_types_v02516` aplicada;
- [x] `rota27_sync_events_type_ck` aceita `turn_closure_repair`;
- [x] Edge Function `rota27-sync` versão 9 ACTIVE;
- [x] `EDGE_VERSION = rota27-sync-v0.25.16`;
- [x] `ALLOWED_TYPES` contém `turn_closure_repair`;
- [x] `receivable_upsert` e `receivable_payment` permanecem aceitos.

## Gate de reparo administrativo
- [x] seq 633: `history_upsert` de Fred com `businessDate/operationalDate = 2026-08-25`;
- [x] seq 634: `receivable_upsert` com `businessDate/operationalDate = 2026-08-25`;
- [x] seq 635: `turn_closure_repair` determinístico;
- [x] seq 539 não foi apagada;
- [x] saldo de Fred permanece R$ 145,00 em aberto;
- [x] nenhum `receivable_payment` foi criado pelo reparo.

## Gate de frontend
- [x] novo asset `assets/v02516-repair.js`;
- [x] repair ID fixo: `repair_turn_fred_20260826_v1`;
- [x] fechamento antigo é arquivado localmente antes de sair da visão efetiva;
- [x] fechamento substituto: `turn_2026-08-25_repair_fred_20260826_v1`;
- [x] cursor próprio de reparo independente dos cursores antigos;
- [x] carregamento do reparo ocorre antes do gerenciador de turnos;
- [x] sem limpeza de `localStorage`;
- [x] sem reinstalação da PWA;
- [x] sem `setInterval` novo;
- [x] sem `MutationObserver` novo;
- [x] Service Worker `rota27-comandas-v0.25.16-r1` inclui o asset do reparo.

## Gate de sintaxe e comportamento local
Validações executadas antes do PR:
- `node --check assets/v02516-repair.js` equivalente local: aprovado;
- `node --check assets/v019-turn-close.js` equivalente local: aprovado;
- `node --check assets/v0256-release.js` equivalente local: aprovado;
- `node --check sw.js` equivalente local: aprovado;
- simulação local com fechamento `turn_2026-08-26` presente: o reparo o arquivou, removeu da visão efetiva e instalou o fechamento de 25/08 com R$ 448,00 / 8 comandas.

## Critério de promoção
Promover somente se o diff permanecer restrito ao reparo, versão/documentação/PWA e não houver regressão de funcionalidades preservadas.

Baseline: **v0.25.15**.
