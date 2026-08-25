# Handoff — Rota 27 v0.25.3

## Baseline oficial
Versão: **v0.25.3 — Consistência Visual do Mapa**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.25.3-r1`  
Rollback: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**.

## O que mudou
A v0.25.3 é exclusivamente um refinamento visual dos cards do Mapa de Comandas.

A visualização Lista já usava faixa lateral bicolor de 6 px, com laranja na parte superior e preto na parte inferior. O Mapa usava uma faixa mais estreita e cores diferentes por zona.

A v0.25.3 unifica essa linguagem:
- 6 px de faixa lateral;
- 68% laranja / 32% preto;
- superfície, borda e sombra coerentes com a Lista;
- Mapa continua compacto.

## Implementação
Arquivos novos:
- `assets/v0253-map-visual.css`;
- `assets/v0253-release.js`.

Arquivos atualizados:
- `VERSION`;
- `index.html`;
- `sw.js`;
- `README.md`;
- `docs/STATUS-PRODUCAO.md`.

## Backend
Sem alteração. Nenhum novo evento, tabela, migration ou Edge Function.

## Estabilidade
Não foi adicionado `setInterval`, polling visual ou `MutationObserver`.

## Regra de produto
Lista e Mapa continuam sendo duas representações das mesmas comandas em `state.commands`; não existe estado paralelo.

## Próximos cuidados
Preservar a faixa lateral bicolor como identidade visual comum entre Lista e Mapa, salvo decisão explícita de redesign global.
