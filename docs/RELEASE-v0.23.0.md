# RELEASE — Rota 27 v0.23.0 — Inventário & Conferência

Data: 24/08/2026

## Resumo
A v0.23.0 fecha o ciclo operacional do Estoque Essencial permitindo comparar o saldo registrado no sistema com a contagem física real e aplicar ajustes somente após revisão e confirmação.

## Entregas
- Inventário integrado ao Estoque Essencial;
- uma sessão aberta por vez;
- snapshot do saldo esperado;
- contagem mobile-first;
- diferença em tempo real;
- busca e filtros;
- pausar/continuar;
- revisão de corretos, faltas e sobras;
- bloqueio com itens pendentes;
- bloqueio se o estoque se mover durante a conferência;
- ajustes somente após confirmação;
- idempotência por `inventory_adjust_<inventoryId>_<productId>`;
- histórico e CSV;
- indicador de inventário na Central do Estoque;
- Ajuda v4.7;
- offline-first e multidispositivo.

## Backend
`rota27-sync` versão **7 ACTIVE**:
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- novo evento `inventory_upsert`;
- `stock_movement` continua responsável pelos ajustes físicos;
- nenhum contrato anterior removido;
- `verify_jwt=false` preservado devido à autenticação própria por `x-rota27-device-token`;
- nenhuma tabela nova.

O inventário reutiliza `rota27_sync_events`.

## Validação
A release foi aprovada em:
- desktop;
- aparelho móvel;
- fluxo completo de inventário;
- proteção contra movimentação concorrente de estoque;
- histórico/CSV;
- offline local;
- smoke multidispositivo A→B.

O teste A→B confirmou sessão, contagens, pausa/continuação, finalização e saldo convergentes sem duplicidade relevante de ajuste.

## Hotfix pós-release — constraint de eventos
Após a promoção para produção, o Estoque Essencial exibiu:
`new row for relation "rota27_sync_events" violates check constraint "rota27_sync_events_type_ck"`.

A causa foi um desalinhamento entre a allowlist da Edge Function e o `CHECK` do PostgreSQL. A Edge já aceitava os contratos novos, mas o constraint ainda parava em `manager_config_replace`.

Foi aplicada em produção a migration:
`20260825012842_expand_rota27_sync_event_types_v023`.

Ela preserva todos os tipos anteriores e acrescenta ao `CHECK`:
- `turn_closed`;
- `stock_config_upsert`;
- `stock_movement`;
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`;
- `inventory_upsert`.

A alteração é aditiva e não destrutiva. Não cria tabela, não remove eventos e não modifica dados existentes.

Após a migration, um smoke transacional inseriu temporariamente todos os 7 tipos novos e confirmou aceitação. A transação foi revertida ao final, sem deixar eventos de teste na produção.

## Compatibilidade
A v0.23 preserva as camadas funcionais anteriores. Por compatibilidade interna, `meta[name=rota27-version]` permanece em `0.22.0` como gate das camadas v0.21/v0.22; a release pública é identificada por `VERSION = 0.23.0`, `rota27-release-version = 0.23.0`, badge/título v0.23.0 e Service Worker `rota27-comandas-v0.23.0`.

Não foi adicionado polling visual nem novo `MutationObserver` concorrente.

## Rollback
Baseline anterior segura: **v0.22.0 — Compras & Reposição**.

## Próxima direção
**v0.24.0 — Custos & Margem**, com custo de aquisição real/registrado; não inferir custo pelo preço de venda.
