# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.63 — Coerência operacional de turnos
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.63-r1`
- **Baseline anterior:** v0.25.62

## Estado funcional atual

### Turnos, Painel e Histórico
- a **data operacional** vem da abertura da comanda;
- o horário físico de fechamento não muda o turno ao qual a venda pertence;
- o Painel substitui a leitura civil de **Hoje** por **Turno atual**;
- faturamento, ticket médio, comandas e itens do Painel consideram somente o movimento desde o último fechamento da data operacional;
- **Consumo interno / próprio** fica fora de faturamento e de valores em aberto;
- o Painel mostra um card compacto de **Último turno fechado** com faturamento, comandas, itens e horário físico do fechamento;
- o Histórico passa a priorizar **Turno atual** e **Último turno**;
- períodos de 7 e 30 dias usam a data operacional das comandas, não apenas `closedAt`;
- cada linha do Histórico diferencia **Turno DD/MM/AAAA** de **fechado DD/MM às HH:MM**;
- dados legados sem `businessDate` usam `createdAt/openedAt` como fallback, nunca `closedAt`.

### A Receber
- permanece separado do faturamento do turno;
- o card do Painel explicita que o valor representa **saldos não recebidos**;
- pagamentos posteriores baixam a pendência e não criam nova venda;
- vencimento opcional **Sem data / Hoje / Amanhã / 7 dias** preservado.

### Consumo interno
- flags `internalConsumption` / `nonRevenue` são revalidadas localmente quando a comanda é identificada como Consumo interno;
- o valor permanece apenas como referência e não entra em faturamento, ticket médio ou formas de pagamento;
- novas comandas passam a receber `businessDate` operacional antes dos próximos snapshots persistidos.

### Demais módulos
- Lista e Mapa de comandas preservados;
- Mais usados hoje, Estoque, Compras, Clientes & Fidelização, Eventos, WhatsApp e Custos & Margem preservados;
- pré-fechamento por exceção preservado.

## Evidência do incidente que motivou a v0.25.63
O fechamento operacional de **28/08/2026**, concluído fisicamente em 29/08 às 08:25, possui snapshot oficial de **R$ 2.350,55**, 22 comandas e 165 itens. Dentro desse total, **R$ 680,80** correspondem a vendas em **A receber**. A interface antiga agrupava essas cinco comandas como “Hoje” porque foram fechadas fisicamente pela manhã, gerando leitura visual incorreta do novo turno.

## Backend
Projeto Supabase: `owkvwsiblbzlpxjwybrt`. A v0.25.63 não altera schema, migration ou Edge Function.

## Roadmap original
Planejamento 0–10 permanece **concluído**. A v0.25.63 é uma correção pós-roadmap de coerência operacional.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.63.md`
- `docs/RELEASE-v0.25.62.md`

## Versão
Produção: **0.25.63**
