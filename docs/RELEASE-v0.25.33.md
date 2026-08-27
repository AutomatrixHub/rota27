# Rota 27 v0.25.33 — Refino do cabeçalho do Cardápio

## Objetivo
Reduzir o peso visual da faixa superior do Cardápio sem remover nenhuma informação ou ação.

## Alterações
- linha de ações `47/47`, `Categorias` e `+ Produto` ligeiramente mais compacta;
- bloco `Gestão do cardápio` reduzido e reposicionado como utilitário secundário;
- `Importar` e `Exportar` preservados com área de toque adequada;
- texto auxiliar de gestão encurtado sem perda de sentido;
- aviso de preços transformado em nota compacta de duas hierarquias;
- mensagem preserva a regra: alterações valem apenas para novos lançamentos e itens já lançados mantêm nome e valor registrados;
- menor espaçamento vertical antes da busca e da lista de produtos.

## Implementação
- novo CSS: `assets/v02533-menu-header-polish.css`;
- novo JS: `assets/v02533-menu-header-polish.js`;
- reaplicação apenas em abertura/retorno ao Cardápio, com assentamento curto e finito;
- sem `MutationObserver` e sem polling contínuo.

## PWA
- VERSION: `0.25.33`;
- Service Worker: `rota27-comandas-v0.25.33-r1`.

## Backend
Sem alteração em catálogo, preços, categorias, comandas, histórico, sincronização, Supabase ou Edge Functions.

## Rollback
v0.25.32 / HEAD `e456f15b3f5d09024b8976be18ff54e6b26d1f22`.
