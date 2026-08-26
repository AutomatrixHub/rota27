# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.15 — Data operacional do turno**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.15-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.15 — Data operacional pela abertura
A data de abertura da comanda define a qual turno a venda pertence. Uma comanda aberta em 26/08 e fechada às 01h ou 02h de 27/08 continua no turno operacional de 26/08; o horário real de fechamento permanece preservado.

Múltiplos turnos no mesmo dia continuam suportados: o fechamento anterior é o corte e somente comandas abertas depois dele entram no próximo turno da mesma data.

## Preservado
- seleção pesquisável de clientes na nova comanda (v0.25.13);
- A receber / Paga depois, inclusive recebimentos parciais;
- rankings por ID/código com nome atual do produto;
- referência de produtos ao editar categorias;
- Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado.

## Backend
A v0.25.15 não cria migration, tabela, Edge Function ou tipo de evento. O `rota27-sync` permanece versão 8 ACTIVE (`rota27-sync-v0.25.12`).

## Ajuda
Ajuda **v6.6** identifica a release v0.25.15.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.15.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.14**.

## Versão
Produção: **0.25.15**
