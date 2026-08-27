# Rota 27 v0.25.34 — Hierarquia visual das ações do Cardápio

## Objetivo
Dar mais clareza visual às ações do topo do Cardápio sem aumentar novamente o volume da faixa refinada na v0.25.33.

## Alterações
- `Categorias` perde o emoji e passa a usar texto limpo;
- `Categorias` ganha fundo âmbar suave, borda própria e relevo discreto;
- `+ Produto` permanece como ação principal;
- `Importar` e `Exportar` ficam ligeiramente maiores e mais evidentes;
- `Importar` usa tom areia suave;
- `Exportar` usa tom verde suave;
- ambos recebem borda mais visível, peso tipográfico maior e sombra discreta.

## Hierarquia preservada
1. `+ Produto` — ação principal;
2. `Categorias` — ação secundária importante;
3. `Importar` / `Exportar` — ações utilitárias destacadas sem competir com a criação de produto.

## Implementação
- `assets/v02534-menu-actions-polish.css`;
- `assets/v02534-menu-actions-polish.js`;
- remoção visual do emoji feita sem alterar a lógica do gerenciador de categorias;
- sem `MutationObserver` e sem polling contínuo.

## PWA
- VERSION `0.25.34`;
- Service Worker `rota27-comandas-v0.25.34-r1`.

## Backend
Nenhuma alteração em catálogo, preços, categorias, comandas, histórico, sincronização, Supabase ou Edge Functions.

## Rollback
v0.25.33 / HEAD `f4e02147080f21565737961dc3467bc28925fd9b`.
