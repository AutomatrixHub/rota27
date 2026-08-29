# Rota 27 — Release v0.25.59

Data: 29/08/2026

## Objetivo

Transformar o histórico de vendas e o saldo disponível em uma leitura simples de **dias de cobertura**, sem criar novos campos de configuração.

## Estoque Essencial

Produtos controlados passam a exibir:

- cobertura estimada em dias;
- média recente de unidades por dia operacional;
- estado **Sem consumo recente** quando não houver base suficiente.

O cálculo considera até os 7 dias operacionais mais recentes presentes no histórico.

Ficam fora da média:

- comandas canceladas;
- consumo interno/próprio;
- registros não faturáveis.

## Compras & Reposição

Para produtos em reposição, a tela informa também:

- cobertura atual;
- quantidade aproximada necessária para chegar a cerca de 7 dias de cobertura.

A quantidade do campo **Comprar** não é alterada automaticamente.

## Item 6 do roadmap

Durante a revisão foi confirmado que o fluxo existente de recebimento de compras já abre cada item com toda a quantidade pendente preenchida. O usuário altera somente as exceções antes de registrar o recebimento.

Esse comportamento já atende ao objetivo planejado de **Receber tudo** com menos atrito do que adicionar um botão redundante.

## Implementação

Novos assets:

- `assets/v02559-stock-coverage.css`;
- `assets/v02559-stock-coverage.js`.

Sem polling contínuo novo, sem MutationObserver novo, sem backend e sem persistência adicional.

## PWA

- VERSION: `0.25.59`;
- cache: `rota27-comandas-v0.25.59-r1`.

## Rollback

Baseline anterior: **v0.25.58** / merge `cb854a335a964a8a2c27d647ddd088bca1773eec`.
