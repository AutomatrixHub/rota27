# Rota 27 — Release candidata v0.18.0

Data: 23/08/2026

## Estado

**CANDIDATA — NÃO PROMOVIDA PARA PRODUÇÃO**

Produção continua em v0.17.1 enquanto a v0.18.0 é validada.

## Objetivo

Adicionar visão gerencial do turno sem tocar no fluxo rápido de lançamento de produtos.

## Resumo do Turno

Novo bloco na tela Histórico com:

- faturamento fechado hoje;
- comandas fechadas;
- comandas abertas;
- valor em aberto;
- ticket médio;
- itens vendidos;
- ranking dos produtos mais vendidos;
- distribuição por forma de pagamento.

## Alertas

A tela saudável permanece discreta. Alertas só aparecem quando existe ação necessária, como:

- aparelho offline;
- erro conhecido da sincronização de domínio;
- WhatsApp de cliente com tentativa pendente após falha;
- WhatsApp do gerente com tentativa pendente após falha;
- cancelamento ainda aguardando sincronização.

## Cancelamentos

A primeira entrega não exibe total histórico de cancelamentos porque a baseline v0.17.1 não persiste esse histórico de forma consolidada após a remoção operacional da comanda. Uma futura trilha de auditoria será necessária para tornar esse indicador confiável.

## Ajuda

Ajuda candidata v4 adiciona a seção `Resumo do turno` e explica os indicadores e alertas.

## Arquivos novos

- `assets/v018.css`;
- `assets/v018-turn-summary.js`;
- `assets/v018-help.js`;
- `assets/v018-final.js`;
- `docs/V0.18-SCOPE.md`;
- `docs/TESTE-v0.18.0.md`.

## Preservações

- sem alteração de banco;
- sem alteração das Edge Functions;
- sem alteração dos templates Meta;
- sem alteração da lógica de totais/fechamento/cancelamento;
- sem sincronizar filas de WhatsApp;
- v0.17.1 continua como rollback/baseline de produção.
