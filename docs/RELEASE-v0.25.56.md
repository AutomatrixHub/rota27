# Rota 27 — Release v0.25.56

Data: 29/08/2026

## Objetivo

Consolidar a baseline real de produção antes da retomada do roadmap funcional.

## Alterações

- `README.md` reconciliado com a produção atual;
- `docs/STATUS-PRODUCAO.md` atualizado de v0.25.28 para a baseline real;
- inventário das principais Edge Functions atualizado;
- funções administrativas temporárias documentadas como tombstones encerrados;
- roadmap pós-v0.25.48 registrado com itens concluídos e pendentes;
- identidade da aplicação atualizada para v0.25.56;
- novo cache PWA `rota27-comandas-v0.25.56-r1`.

## Auditoria Supabase

Confirmado que:

- `rota27-whatsapp` v23 ACTIVE;
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp-inbound` v3 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE;
- `rota27-event-campaign` v4 ACTIVE;
- `rota27-event-delivery-status` v1 ACTIVE;
- `rota27-audit` v1 ACTIVE.

As funções administrativas específicas de Beto/Mamute exigem JWT e respondem HTTP 410; não executam mais ações administrativas.

## Escopo

Esta release não altera regras de negócio, dados, Supabase, WhatsApp, comandas, estoque, fechamento ou sincronização. É uma consolidação documental/operacional e de identidade da baseline.

## Roadmap

Próximo item funcional: **Aniversários próximos**.

## PWA

- VERSION: 0.25.56
- cache: `rota27-comandas-v0.25.56-r1`

## Rollback

Baseline funcional anterior: v0.25.55-r2 / merge `a1103b5056ea2d70533275adeabd300c926fb2fc`.
