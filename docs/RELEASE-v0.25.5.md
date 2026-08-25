# Rota 27 v0.25.5 — Mapa Refinado & Cópia Fixa de WhatsApp

Data: 25/08/2026

## Objetivo
Fechar dois ajustes operacionais solicitados em uso real:
1. tornar os cards do Mapa visualmente mais claros e úteis;
2. enviar os mesmos lançamentos operacionais também para um segundo número fixo de WhatsApp.

## Mapa
A v0.25.5 deixa de copiar literalmente a faixa lateral da Lista para o card compacto.

Novo desenho:
- acento laranja fino de 3 px;
- sem bloco preto inferior;
- fundo creme, borda e sombra coerentes com a Lista;
- Balcão prioriza o nome do cliente;
- Mesas/Parklet preservam o identificador espacial;
- zona/local aparece como contexto secundário quando necessário.

Não há alteração na fonte de dados, abertura da comanda ou organização por zonas.

## Cópia fixa de WhatsApp
Destino fixo:

`+55 27 99776-9279` / `5527997769279`

Implementação:
- número declarado no `index.html` em `rota27-fixed-copy-whatsapp`;
- nova fila local `rota27_v0255_fixed_copy_outbox_v1`;
- batching de 4,5 s, como a cópia do gerente;
- retry exponencial;
- reutilização da mesma Edge Function `rota27-whatsapp` e dos templates existentes;
- sem envio duplicado quando gerente ou cliente já correspondem ao número fixo.

## Backend
Nenhuma alteração de Edge Function, banco, migration, evento de sync ou segredo.

## PWA
- `VERSION = 0.25.5`;
- cache `rota27-comandas-v0.25.5-r1`;
- Ajuda v5.6.

## Arquivos principais
- `assets/v0255-map-card.css`
- `assets/v0255-map-card.js`
- `assets/v0255-fixed-whatsapp-copy.js`
- `assets/v0255-release.js`
- `index.html`
- `sw.js`

## Rollback
Baseline: **v0.25.4 — Mapa Refinado**.
