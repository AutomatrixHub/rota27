# Rota 27 — Release v0.16.1

Data de preparação: 21/08/2026

## Objetivo

Hotfix preventivo sobre a v0.16.0 antes do piloto real de 22/08/2026.

## Problema identificado

A v0.15.1 utilizava `assets/v015-final.js` para proteger continuamente o selo e o título da versão por `MutationObserver`. A v0.16.0 introduziu um novo protetor de versão.

Manter os dois protetores carregados ao mesmo tempo poderia fazer as duas camadas disputarem o mesmo selo/título (`v0.15.1` × `v0.16.0`), gerando mutações repetidas e consumo desnecessário de recursos.

## Correção

- `index.html` deixa de carregar `assets/v015-final.js`;
- `index.html` deixa de carregar `assets/v016-final.js`;
- novo `assets/v0161-final.js` passa a ser o único protetor final de versão;
- Service Worker passa a usar o cache `rota27-comandas-v0.16.1`;
- finals legados deixam de fazer parte do app shell ativo;
- versão pública passa para **v0.16.1**.

## Preservações

Nenhuma alteração em:

- abertura de comandas;
- lançamento de produtos;
- cálculo de total;
- fechamento;
- cancelamento;
- `localStorage`;
- sincronização multidispositivo;
- `rota27-sync`;
- `rota27-whatsapp`;
- fila local do WhatsApp;
- secrets/tokens;
- conteúdo funcional da Ajuda v0.16.0.

## Baseline para o piloto

A v0.16.1 substitui a v0.16.0 como baseline oficial para o piloto real de 22/08/2026.

Durante o turno, volta a valer o congelamento operacional: P0/P1 podem justificar hotfix; P2/P3 devem ser registrados para depois do turno.
