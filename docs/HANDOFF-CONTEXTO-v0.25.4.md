# Handoff — Rota 27 v0.25.4

## Baseline oficial
Versão: **v0.25.4 — Mapa Refinado**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.25.4-r1`  
Rollback: **v0.25.3**.

## O que mudou
A v0.25.4 é um refinamento visual isolado da visualização Mapa.

A v0.25.3 copiou literalmente a faixa lateral bicolor da Lista para cards compactos. No uso real, a faixa de 6 px e o corte 68/32 ficaram visualmente pesados.

A v0.25.4 adapta o mesmo conceito:
- faixa de 4 px;
- respiro no topo/base;
- predominância de laranja;
- preto curto na parte inferior;
- transição suavizada;
- nenhuma cor por zona.

## Lógica preservada
Sem alteração em:
- comandas;
- Lista/Mapa;
- abertura por toque;
- classificação em Mesas/Balcão/Parklet/Clientes/Outros;
- sincronização;
- WhatsApp;
- estoque/compras/inventário/custos;
- Painel e Clientes & Fidelização.

## Backend
Nenhuma alteração.

## Estabilidade
A camada `v0254-map-accent.css` é puramente visual. `v0254-release.js` atualiza apenas identidade de Ajuda/release e não adiciona polling ou `MutationObserver`.
