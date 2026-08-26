# Rota 27 v0.25.16 — Reparo histórico de fechamento

## Motivo
A v0.25.15 passou a definir a data operacional pela abertura da comanda, mas não podia reescrever um fechamento imutável já gravado antes de sua publicação.

O caso crítico é a comanda `c1787690191876`:
- cliente: Fred;
- local: Balcão;
- valor: R$ 145,00;
- aberta em 25/08/2026 17:36:31 BRT;
- fechada administrativamente em 26/08/2026 09:19:42 BRT;
- forma: A receber;
- receivable: `recv_c1787690191876`;
- `receivable_upsert`: seq 535;
- `command_closed`: seq 536;
- fechamento inconsistente: seq 539, `turn_closed_2026-08-26` / `turn_2026-08-26`.

## Verdade operacional reconstruída
A consulta do event log canônico encontrou 8 comandas fechadas abertas em 25/08. O turno correto de 25/08 é:
- faturamento: **R$ 448,00**;
- comandas fechadas: **8**;
- itens: **33 unidades**;
- A receber: R$ 145,00;
- Pix: R$ 132,00;
- Débito: R$ 104,00;
- Crédito: R$ 67,00;
- ticket médio: R$ 56,00.

O fechamento de 26/08 / seq 539, com R$ 145,00, não é apagado. Ele permanece no event log para auditoria e é supersedido somente na visão operacional efetiva.

## Reparo administrativo aplicado no Supabase
Foram gravados eventos determinísticos e idempotentes:
- seq **633** — `history_upsert` — `admin_history_fix_fred_businessdate_20260825_v02516`;
- seq **634** — `receivable_upsert` — `admin_receivable_fix_fred_businessdate_20260825_v02516`;
- seq **635** — `turn_closure_repair` — `turn_closure_repair_fred_20260826_v1`.

A comanda e o recebível de Fred receberam:
- `businessDate = 2026-08-25`;
- `operationalDate = 2026-08-25`;
- `administrativeClosedAt` preservando o fechamento real;
- `closedAt` original preservado;
- saldo de R$ 145,00 continua aberto; nenhum `receivable_payment` fictício foi criado.

## Novo tipo de evento
Novo tipo administrativo: `turn_closure_repair`.

As duas pontas foram atualizadas juntas:
- migration `expand_rota27_sync_event_types_v02516` adiciona o tipo ao `rota27_sync_events_type_ck`;
- `rota27-sync` versão **9 ACTIVE** adiciona o tipo a `ALLOWED_TYPES`;
- `EDGE_VERSION = rota27-sync-v0.25.16`.

## Reparo local / multidispositivo
Novo asset `assets/v02516-repair.js`:
- possui descriptor determinístico `repair_turn_fred_20260826_v1`;
- mantém arquivo auditável local do fechamento supersedido;
- retira `turn_2026-08-26` apenas da visão operacional efetiva;
- instala `turn_2026-08-25_repair_fred_20260826_v1` como fechamento canônico;
- usa cursor próprio `rota27_v02516_turn_repair_cursor_v1` para ler reparos mesmo se o cursor antigo de turnos já tiver avançado;
- reaplica a proteção em inicialização, retorno online e visibilidade, com tentativas finitas e sem polling visual contínuo;
- não usa `MutationObserver`;
- não limpa `localStorage`;
- não exige reinstalação da PWA.

`assets/v019-turn-close.js` carrega o reparo antes do gerenciador de turnos para reduzir o risco de reintrodução do fechamento antigo durante a atualização.

## PWA
- `VERSION = 0.25.16`;
- cache `rota27-comandas-v0.25.16-r1`;
- `assets/v02516-repair.js` incluído no APP_SHELL;
- Ajuda v6.7.

## Preservado
- data operacional pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- A receber / Paga depois e baixas parciais/totais sem duplicar venda;
- seletor pesquisável de clientes;
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp `+55 27 99776-9279`;
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Rollback
Baseline de rollback do código: **v0.25.15**.

O rollback de código **não** apaga os eventos 633–635 e **não** desfaz a migration do tipo `turn_closure_repair`. O evento histórico seq 539 continua preservado em qualquer cenário.
