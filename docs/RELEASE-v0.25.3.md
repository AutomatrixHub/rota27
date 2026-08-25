# Release v0.25.3 — Consistência Visual do Mapa

Data: 25/08/2026

## Objetivo
Alinhar visualmente os cards da visualização **Mapa** aos cards da visualização **Lista**, mantendo o Mapa compacto para celular.

## Alteração principal
Os cards do Mapa passam a usar:
- superfície creme do tema;
- borda de 1 px;
- sombra leve;
- cantos arredondados coerentes;
- faixa lateral de 6 px;
- laranja nos 68% superiores;
- preto nos 32% inferiores.

A regra reproduz a gramática visual já consolidada nos cards da Lista.

As zonas Mesas, Balcão, Parklet, Clientes e Outros locais continuam funcionando exatamente como antes; apenas deixam de usar cores laterais diferentes como identidade do card.

## Preservado
- Lista;
- Mapa e classificação por zonas;
- toque para abrir comanda;
- atalhos de nova comanda;
- preferência Lista/Mapa;
- Painel padronizado da v0.25.2;
- Clientes & Fidelização;
- Estoque, Compras, Inventário e Custos;
- sincronização A/B;
- operação offline-first.

## Backend
Sem alteração de Supabase, eventos, tabelas, migrations ou Edge Functions.

## PWA
- versão: `0.25.3`;
- cache: `rota27-comandas-v0.25.3-r1`;
- novos assets: `assets/v0253-map-visual.css` e `assets/v0253-release.js`.

## Ajuda
Identidade atualizada para `Ajuda v5.4 • Rota 27 v0.25.3`.

## Rollback
Baseline anterior: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**.
