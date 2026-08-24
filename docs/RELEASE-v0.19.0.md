# Rota 27 — Release v0.19.0

Data: 24/08/2026

## Estado

**PRODUÇÃO — VALIDADA**

A v0.19.0 foi validada e promovida sobre a v0.18.3.

## Objetivo

Adicionar um encerramento operacional confiável do dia sem aumentar a complexidade durante o atendimento.

## Fechamento do Turno

A nova camada introduz:

- botão `Fechar turno` no Histórico;
- bloqueio com comandas abertas;
- bloqueio com cancelamentos ainda pendentes;
- conferência final de faturamento, fechadas, canceladas, ticket, itens, produtos e formas de pagamento;
- snapshot imutável por data;
- histórico `Fechamentos`;
- bloqueio de novas comandas após o encerramento do dia;
- persistência local-first;
- funcionamento offline;
- outbox própria para o fechamento;
- sincronização multidispositivo via `turn_closed`;
- proteção contra duplicação e conflito do fechamento da mesma data.

## Backend

`rota27-sync` foi atualizado para versão 3 ACTIVE (`rota27-sync-v0.19.0`). A mudança é compatível e acrescenta somente o evento `turn_closed` ao contrato existente.

Não houve migration destrutiva e nenhum fluxo de WhatsApp foi alterado.

## Ajuda v4.3

A Ajuda Tema Capixaba passa a explicar o Fechamento do Turno, incluindo bloqueios, snapshot imutável, consulta de dias fechados, uso offline e sincronização.

## Preservações

Permanecem inalterados:

- cálculo de total das comandas;
- lançamento e remoção de itens;
- fechamento e cancelamento de comandas;
- Auditoria;
- Resumo do Turno;
- WhatsApp do cliente;
- WhatsApp do gerente;
- respostas inbound;
- filas de WhatsApp locais por aparelho;
- identidade visual oficial da v0.18.3.

## Validação

Foram testados os cenários de bloqueio, fechamento válido, consulta posterior, bloqueio de nova comanda, comportamento offline/sincronização, Ajuda e smoke de regressão.

Resultado final reportado: **tudo testado e validado**.

## Rollback

A v0.18.3 permanece como baseline anterior de rollback.

## Atualização da PWA

1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.19.0`.

Não reinstalar e não limpar os dados locais.
