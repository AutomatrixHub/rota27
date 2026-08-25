# Rota 27 v0.25.4 — Mapa Refinado

## Estado
**PRODUÇÃO autorizada em 25/08/2026.**

Baseline anterior: **v0.25.3 — Consistência Visual do Mapa**.

## Objetivo
Refinar o acento lateral dos cards compactos da visualização Mapa depois do uso real mostrar que a cópia literal da faixa 6 px / 68-32 da Lista ficou pesada em cards menores.

## Alteração visual
- mantém a linguagem laranja + preto da Lista;
- reduz a faixa para 4 px;
- cria respiro de 7 px no topo e na base;
- cantos internos arredondados;
- laranja ocupa a maior parte da faixa;
- preto vira acabamento inferior curto;
- transição entre laranja e preto passa a ser progressiva;
- card continua compacto e clicável.

## Arquivos
- `assets/v0254-map-accent.css`;
- `assets/v0254-release.js`;
- `index.html`;
- `sw.js`;
- `VERSION`.

## PWA
- versão: `0.25.4`;
- cache: `rota27-comandas-v0.25.4-r1`;
- Ajuda: `v5.5`.

## Backend
Sem alteração de Supabase, banco, eventos, migrations ou Edge Functions.

## Rollback
**v0.25.3**.
