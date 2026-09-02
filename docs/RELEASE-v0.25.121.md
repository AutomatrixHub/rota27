# v0.25.121 — Visão Gerencial por mês

## Entrega

- Adiciona o botão **Mês** na Visão Gerencial.
- Abre um seletor nativo de mês e ano.
- Consolida somente os fechamentos imutáveis do mês escolhido.
- Mantém métricas, gráfico, listas e CSV no mesmo recorte.
- Compara o resultado com o mês calendário anterior quando houver fechamentos suficientes.

## Segurança

O filtro apenas consulta snapshots já fechados. Não altera vendas, comandas, fechamentos, sincronização ou dados locais.
