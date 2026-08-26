# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.13 — Seleção de cliente na nova comanda**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.13-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 8 ACTIVE (`rota27-sync-v0.25.12`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.12 — Pendências / A Receber**.

## v0.25.13 — Seleção de cliente
Ao abrir uma nova comanda, o campo **Cliente** possui lista pesquisável própria, compatível com iPhone/PWA.

Regras:
- mostra clientes cadastrados ao tocar no campo;
- filtra enquanto digita por nome ou WhatsApp;
- ao selecionar, preenche nome e WhatsApp cadastrados;
- consentimento de WhatsApp permanece manual;
- nome novo continua permitido livremente;
- não depende apenas do `<datalist>` nativo do Safari/iOS.

## v0.25.12 preservado
Permanece ativo **A receber / Paga depois**, com pendências, recebimentos parciais/totais e sincronização `receivable_upsert` / `receivable_payment`.

## Backend
A v0.25.13 não altera Supabase, Edge Functions, migrations ou tipos de evento. `rota27-sync` permanece versão 8 ACTIVE (`rota27-sync-v0.25.12`).

## Preservado
- rankings por ID/código com nome atual do produto;
- lista de referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento.

## Ajuda
Ajuda **v6.4**, identificando Rota 27 v0.25.13.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.13`.

Ver `docs/RELEASE-v0.25.13.md`.
