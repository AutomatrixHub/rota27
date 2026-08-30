# Release v0.25.69 — Organização do cardápio e categorias

Data: 30/08/2026

## Objetivo
Melhorar a navegação do catálogo administrativo e acelerar o lançamento de produtos nas comandas.

## Cardápio administrativo
- produtos ordenados alfabeticamente por nome;
- novas abas/chips de filtro acima da lista;
- ordem: **Todos → Cervejas → Bebidas → demais categorias alfabeticamente**;
- busca e categoria funcionam em conjunto;
- produtos ativos/inativos continuam administráveis.

## Lançamento na comanda
As abas passam a usar:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. demais categorias pela quantidade histórica vendida, em ordem decrescente;
5. empate por ordem alfabética.

### Fonte do ranking
- unidades de `state.history` de comandas fechadas;
- `internalConsumption=true` e `nonRevenue=true` são excluídos;
- categoria do `itemMeta` histórico tem prioridade sobre o catálogo atual;
- ranking fica cacheado enquanto o histórico não muda, evitando reprocessamento a cada toque no iPhone.

## Arquivos principais
- `assets/v02569-menu-category-order.js`;
- `assets/v02569-menu-category-order.css`;
- `assets/v0256-release.js`;
- `assets/roadmap-loader.js`;
- `index.html`;
- `sw.js`.

## Publicação
- `VERSION`: 0.25.69;
- shell declara `rota27-release-version=0.25.69`;
- asset carregado diretamente pelo shell, pelo release loader legado e pelo roadmap loader;
- Service Worker: `rota27-comandas-v0.25.69-r1`.

## Preservação
- sem alteração de dados;
- sem migration;
- sem Edge Function;
- sem mudança de preço ou estoque;
- sem polling contínuo ou `MutationObserver`.
