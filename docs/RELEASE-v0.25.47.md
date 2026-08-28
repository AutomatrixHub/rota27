# Rota 27 — Release v0.25.47

Data: 28/08/2026

## Objetivo

Reduzir toques durante o lançamento de produtos sem exigir favoritos ou configuração manual.

## Mais usados hoje

O bloco de atalhos do Cardápio passa a priorizar automaticamente os produtos mais lançados na data operacional atual, considerando:

- comandas ainda abertas;
- comandas fechadas do mesmo dia;
- somente produtos ainda ativos no catálogo.

São exibidos até 6 atalhos. Se ainda não houver uso no dia, o sistema mantém o benefício anterior e usa o histórico recente como fallback.

Os atalhos aparecem somente na visão padrão do Cardápio, sem busca e com a categoria Todos. O catálogo completo permanece logo abaixo.

## Interface

- ícones SVG no mesmo padrão vetorial já usado no Cardápio;
- sem emojis novos;
- quantidade lançada aparece como referência compacta;
- nenhum novo cadastro, favorito manual ou configuração.

## Implementação

- `assets/v02547-turn-favorites.css`;
- `assets/v02547-turn-favorites.js`;
- novo `assets/roadmap-loader.js`, que passa a carregar incrementos futuros de forma menor e isolada.

A atualização é orientada por renderização e eventos existentes. Não há polling contínuo nem MutationObserver novo.

## Preservações

Não altera preços, catálogo, lançamentos, estoque, fechamento, sincronização, clientes, WhatsApp ou backend.

## PWA

- VERSION: 0.25.47
- cache: `rota27-comandas-v0.25.47-r1`

## Rollback

Baseline anterior: v0.25.46.
