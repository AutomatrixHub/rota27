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
- nenhuma migration/tabela nova.

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

## Compatibilidade
A v0.23 preserva as camadas funcionais anteriores. Por compatibilidade interna, `meta[name=rota27-version]` permanece em `0.22.0` como gate das camadas v0.21/v0.22; a release pública é identificada por `VERSION = 0.23.0`, `rota27-release-version = 0.23.0`, badge/título v0.23.0 e Service Worker `rota27-comandas-v0.23.0`.

Não foi adicionado polling visual nem novo `MutationObserver` concorrente.

## Rollback
Baseline anterior segura: **v0.22.0 — Compras & Reposição**.

## Próxima direção
**v0.24.0 — Custos & Margem**, com custo de aquisição real/registrado; não inferir custo pelo preço de venda.
