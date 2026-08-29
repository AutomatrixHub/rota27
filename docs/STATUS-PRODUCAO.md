# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.63 — Coerência operacional de turnos**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.63-r1`;
- baseline anterior: **v0.25.62**, merge `a3e2cf9a5dc90b45f5fc0733f52b31aa9f0ebbba`.

## Incidente validado
O fechamento operacional de **28/08/2026** foi concluído fisicamente em **29/08/2026 às 08:25**. O evento `turn_closed` no Supabase registra corretamente:
- faturamento: **R$ 2.350,55**;
- 22 comandas fechadas;
- 165 itens;
- ticket médio: R$ 106,84;
- Crédito: R$ 910,95;
- **A receber: R$ 680,80**;
- Pix: R$ 395,85;
- Débito: R$ 362,95.

A interface anterior exibia R$ 680,80 como “Faturamento hoje” porque cinco comandas do turno de 28/08 foram fechadas fisicamente na manhã de 29/08. O dado oficial do fechamento estava correto; a inconsistência era de agrupamento e apresentação.

## Correção v0.25.63

### Painel
- substitui a leitura civil de **Hoje** por **Turno atual**;
- calcula faturamento, ticket, comandas e itens pela **data operacional da abertura** e pelo último fechamento daquela data;
- comandas de Consumo interno / próprio são excluídas de faturamento e de valores em aberto;
- exibe **Último turno fechado** com faturamento, comandas, itens e horário físico do fechamento;
- A Receber é identificado como **saldos não recebidos**, separado de faturamento.

### Histórico
- prioridade visual: **Turno atual** e **Último turno**;
- 7 e 30 dias passam a usar `businessDate`/data operacional;
- dados legados sem `businessDate` derivam a data de `createdAt/openedAt`, nunca de `closedAt`;
- cada linha diferencia a data do turno e o horário físico do fechamento;
- o resumo superior acompanha o recorte operacional selecionado.

### Consumo interno
- comandos identificados como `Consumo interno` ou `own_consumption` são revalidados como `internalConsumption=true` e `nonRevenue=true` antes dos próximos saves;
- valor interno permanece apenas como referência e não entra nas métricas de vendas;
- o caso observado de R$ 18,00 deixa de aparecer em “Em aberto”/faturamento.

## Backend Supabase
Projeto `owkvwsiblbzlpxjwybrt`.
- nenhuma migration;
- nenhum schema alterado;
- nenhuma Edge Function alterada;
- dados históricos não são regravados;
- o snapshot `turn_closed` de 28/08 permanece imutável.

## Roadmap original
Itens 0–10 continuam **concluídos**. A v0.25.63 é uma correção pós-roadmap motivada por uso real na virada de turno.

## Regras de preservação
- não limpar `localStorage` de produção;
- não reinstalar a PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.62** / merge `a3e2cf9a5dc90b45f5fc0733f52b31aa9f0ebbba`.
