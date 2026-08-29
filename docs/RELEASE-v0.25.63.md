# RELEASE v0.25.63 — Coerência operacional de turnos

Data: 29/08/2026

## Objetivo
Corrigir a inconsistência visual observada após um turno atravessar a meia-noite e ser fechado na manhã seguinte. A fonte de verdade operacional passa a ser a data da abertura da comanda (`businessDate`/`operationalDate`), e não a data física de `closedAt`.

## Evidência real
O turno operacional de 28/08/2026 foi fechado em 29/08 às 08:25. O snapshot oficial `turn_closed` registra R$ 2.350,55, 22 comandas e 165 itens. R$ 680,80 correspondem apenas às cinco vendas em **A receber** fechadas fisicamente pela manhã. A tela antiga agrupava essas cinco comandas como “Hoje”, criando a falsa leitura de que R$ 680,80 pertenciam ao novo turno.

## Alterações

### Painel
- “Hoje” deixa de ser o agrupador de vendas e passa a **Turno atual**;
- métricas do turno atual usam data operacional e o último fechamento como corte;
- Consumo interno/próprio é excluído de faturamento, ticket e valor em aberto;
- novo card compacto **Último turno fechado** mostra faturamento, comandas, itens e horário físico do fechamento;
- A Receber passa a explicitar **saldos não recebidos**.

### Histórico
- `Hoje` passa visualmente a **Turno atual**;
- `Ontem`/último fechamento passa a **Último turno**;
- períodos de 7 e 30 dias usam data operacional;
- cada linha mostra separadamente `Turno DD/MM/AAAA` e `fechado DD/MM às HH:MM`;
- o resumo superior acompanha o recorte operacional selecionado;
- dados antigos sem `businessDate` usam `createdAt/openedAt` como fallback.

### Consumo interno
- comandos identificados como Consumo interno são revalidados localmente com `internalConsumption=true` e `nonRevenue=true` antes dos próximos saves;
- o valor continua sendo apenas referência;
- o lançamento real de R$ 18,00 observado após a abertura do novo turno deixa de contaminar as métricas de vendas.

### Persistência futura
A camada v0.25.63 normaliza `businessDate`/`operationalDate` em comandos que ainda não possuem a data explícita antes dos próximos saves. Isso melhora os snapshots futuros sem reescrever os dados históricos existentes.

## Segurança e estabilidade
- sem migration;
- sem Edge Function nova;
- sem alteração de schema;
- sem reset ou regravação de dados históricos;
- sem novo `MutationObserver`;
- sem polling adicional;
- o snapshot oficial de fechamento permanece imutável.

## Arquivos
- `assets/v02563-operational-turn-coherence.js`
- `assets/v02563-operational-turn-coherence.css`
- `assets/roadmap-loader.js`
- `index.html`
- `sw.js`
- `VERSION`
- `README.md`
- `docs/STATUS-PRODUCAO.md`

## Service Worker
`rota27-comandas-v0.25.63-r1`

## Rollback
Baseline anterior: v0.25.62 / merge `a3e2cf9a5dc90b45f5fc0733f52b31aa9f0ebbba`.
