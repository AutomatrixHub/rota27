# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.15 — Data operacional do turno**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.15-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 8 ACTIVE (`rota27-sync-v0.25.12`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.14 — Novo turno no mesmo dia**.

## v0.25.15 — Data operacional do turno
A data operacional passa a ser determinada pela **abertura da comanda**, não pelo instante do fechamento.

Regras:
- aberta em 26/08 e fechada em 27/08 às 01h/02h → pertence a 26/08;
- `closedAt` real permanece preservado para auditoria;
- uma comanda aberta antes da meia-noite continua bloqueando o fechamento do turno de origem até ser resolvida;
- múltiplos turnos no mesmo dia continuam possíveis;
- o fechamento anterior funciona como corte: só comandas abertas depois dele entram no turno seguinte da mesma data;
- históricos antigos sem movimento recente não assumem o turno corrente.

## A receber
`A receber / Paga depois` segue a mesma regra de data operacional. A pendência e o histórico recebem `businessDate`/`operationalDate` pela abertura, sem reescrever o horário real de fechamento.

## Cliente cadastrado
Permanece ativo o seletor pesquisável da v0.25.13 na nova comanda, compatível com iPhone/PWA, com busca por nome/WhatsApp e digitação livre para cliente novo.

## Backend
Sem nova migration, Edge Function, tabela ou tipo de evento. Permanecem os eventos e o `rota27-sync` versão 8 já existentes.

## Preservado
- A receber e recebimentos parciais/totais;
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento.

## Ajuda
Ajuda **v6.6**, identificando Rota 27 v0.25.15.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.15`.

Ver `docs/RELEASE-v0.25.15.md`.
