# Rota 27 — Release v0.20.0

Data: 24/08/2026

## Estado

**PRODUÇÃO — VALIDADA**

A v0.20.0 foi validada e promovida sobre a v0.19.0.

## Objetivo

Transformar os snapshots imutáveis do Fechamento do Turno em informação gerencial útil, comparável e segura, sem aumentar a complexidade do atendimento.

## Visão Gerencial

A nova camada adiciona em `Painel → Visão Gerencial`:

- filtros de 7, 30, 90 dias e todo o histórico;
- faturamento acumulado;
- média por turno fechado;
- ticket médio;
- comandas fechadas;
- itens vendidos;
- cancelamentos;
- comparação com o período anterior equivalente;
- gráfico de faturamento por turno fechado;
- melhor dia do período;
- consolidação de produtos mais vendidos;
- consolidação das formas de pagamento;
- exportação CSV dos fechamentos reais.

A fonte de verdade são os registros imutáveis criados pela v0.19.0. Dias sem fechamento não são considerados automaticamente como faturamento zero.

## Modo demonstração

A v0.20.0 inclui um recurso de produção opcional para apresentação e treinamento:

- começa desligado;
- é ativado manualmente dentro da Visão Gerencial;
- produz uma base simulada somente em memória;
- é identificado visualmente como demonstração;
- não grava em `localStorage`;
- não sincroniza;
- não altera comandas, histórico, clientes, cardápio ou fechamentos reais;
- não interfere em WhatsApp;
- CSV é bloqueado durante a demonstração;
- ao recarregar o app, a visualização volta aos dados reais.

O objetivo é permitir explorar gráficos e comparações sem contaminar os números da loja.

## Ajuda

A Ajuda passa para **v4.4**, preservando o Tema Capixaba e incluindo:

- Visão Gerencial;
- períodos e comparações;
- leitura de gráficos e rankings;
- exportação CSV;
- explicação do Modo demonstração e sua separação dos dados reais.

## Backend

Nenhuma migration, tabela ou Edge Function nova foi necessária.

Permanecem:

- `rota27-sync` v3 ACTIVE, responsável também pela sincronização de `turn_closed`;
- `rota27-audit` v1 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v1 ACTIVE.

## Preservações

A v0.20.0 não altera:

- cálculo de total;
- lançamento e remoção de itens;
- fechamento/cancelamento de comandas;
- Fechamento do Turno;
- contratos de sincronização;
- WhatsApp do cliente/gerente;
- filas locais de WhatsApp;
- identidade visual oficial da operação.

## Atualização da PWA

Não reinstalar e não limpar dados.

1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.20.0`.

## Rollback

Baseline anterior: **v0.19.0**.
