# v0.25.119 — Histórico por data específica

## Entrega

- Inclui o botão **Data** nos períodos do Histórico.
- O botão revela um calendário nativo para escolher uma data operacional.
- O recorte selecionado atualiza resumo, métricas, rankings, lista de comandas e exportação CSV.

## Regra de data

A venda pertence à data operacional da abertura da comanda. Assim, um fechamento físico após a meia-noite continua aparecendo no turno correto.

## Segurança

Esta entrega apenas lê o histórico para montar o recorte. Não altera vendas, comandas, fechamentos, sincronização ou armazenamento local.
