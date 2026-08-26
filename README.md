# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.9 — Limpeza de Produção & Referência de Categoria**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.9-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.9 — limpeza controlada de produção
Foi removida da base remota e dos aparelhos a comanda de teste específica:

`c1787598217117` — **Mamute / Mesa 1 / R$ 22,00 / 24/08/2026**.

A limpeza:
- remove a comanda do histórico e de qualquer lista local;
- limpa outboxes relacionadas;
- corrige `lastSeenAt` local do cliente sem apagar o cadastro;
- corrige o fechamento de 24/08 retirando a venda de R$ 22,00 e preservando o fechamento do turno;
- mantém proteção local contra reaparecimento dessa comanda em aparelhos ainda desatualizados.

No Supabase foram removidos os eventos da comanda, os logs técnicos de WhatsApp vinculados e os dois `client_upsert` contaminados pelo teste; o evento `turn_closed_2026-08-24` foi corrigido para faturamento/quantidade zerados naquele resumo.

## Categorias — referência de produtos
Ao tocar em **Editar** numa categoria, a folha de edição passa a mostrar uma lista somente leitura dos produtos daquela categoria, com:
- nome;
- preço;
- status ativo/inativo.

A lista é apenas referência. A edição de produto continua sendo feita pelo fluxo normal do Cardápio.

## Comandas — Lista + Mapa
Permanece a paridade visual da v0.25.6, com o Mapa reutilizando a estrutura visual da Lista e mantendo o card inteiro clicável.

## WhatsApp — cópia fixa contínua
Novos lançamentos continuam sendo enviados adicionalmente para `+55 27 99776-9279` (`5527997769279`).

O replay histórico de 25/08 permanece hibernado.

## Backend
A v0.25.9 não cria nova Edge Function, tabela, migration ou tipo de evento. Houve somente limpeza/correção de dados existentes no Supabase.

## Ajuda
Ajuda **v6.0** identifica a release v0.25.9.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.9.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.8**.

## Versão
Produção: **0.25.9**
