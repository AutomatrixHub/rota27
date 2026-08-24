# Rota 27 — Release v0.18.1

Data: 23/08/2026

## Estado

**PRODUÇÃO — VALIDADA**

A v0.18.1 foi validada no fluxo operacional e promovida a partir da v0.18.0.

## Objetivo

Criar a fundação de auditoria operacional necessária para conferir o turno e contabilizar cancelamentos de forma rastreável, sem acrescentar passos ao atendimento.

## Auditoria do turno

A v0.18.1 registra e apresenta:

- abertura de comanda;
- fechamento de comanda;
- cancelamento de comanda;
- adição e remoção de itens;
- alteração de dados da comanda;
- horário e aparelho de origem quando disponível.

O registro local continua funcionando offline.

## Reconciliação multidispositivo

Foi adicionada a Edge Function isolada `rota27-audit` v1. Ela é somente leitura e consulta a trilha já existente em `rota27_sync_events`, usando a mesma autenticação própria por token de dispositivo da sincronização.

A função não altera comandas, histórico, catálogo, sync, WhatsApp ou banco. Quando a sincronização está configurada, a PWA reconcilia a auditoria local com os eventos compartilhados do turno.

## Resumo do Turno

O cartão redundante `Valor em aberto` foi substituído por **Canceladas**. O valor em aberto continua visível como informação secundária do cartão `Em aberto`.

O Resumo também ganhou o botão **Ver auditoria**, que abre a linha do tempo do turno.

## Ajuda

A Ajuda v4.1 inclui a seção `Auditoria operacional` explicando:

- o que é registrado;
- onde consultar;
- comportamento offline;
- reconciliação quando a sincronização volta;
- que auditoria é uma camada de conferência e não altera a operação.

## Backend

Novo endpoint isolado:

- `rota27-audit` v1 ACTIVE;
- `verify_jwt=false` porque aplica autenticação própria `x-rota27-device-token`, igual ao contrato da PWA;
- nenhuma migration nova;
- nenhuma alteração em `rota27-sync`;
- nenhuma alteração em `rota27-whatsapp` ou `rota27-whatsapp-inbound`.

## Validação

Em 23/08/2026 a v0.18.1 foi testada no fluxo operacional com abertura de comanda, lançamentos, remoção, cancelamento, Resumo do Turno e consulta da linha do tempo. O resultado reportado foi **tudo funcionando perfeitamente**.

## Preservações

- sem mudança no cálculo de total;
- sem mudança em fechamento/cancelamento;
- sem mudança no fluxo de lançamento rápido;
- sem sincronizar outboxes de WhatsApp;
- sem limpeza/migração destrutiva;
- v0.18.0 permanece como baseline anterior de rollback.
