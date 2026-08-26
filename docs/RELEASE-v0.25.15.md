# Rota 27 v0.25.15 — Data operacional do turno

## Motivo
A operação da Rota 27 frequentemente começa durante o dia e termina depois da meia-noite. A data civil do fechamento não pode deslocar uma venda para o expediente seguinte.

## Regra operacional
A **data de abertura da comanda** define a data operacional à qual ela pertence.

Exemplo:
- comanda aberta em 26/08 às 14:00;
- comanda fechada em 27/08 às 01:30;
- a venda permanece no turno operacional de **26/08**;
- o horário real de fechamento continua preservado para auditoria.

## Múltiplos turnos no mesmo dia
A regra da v0.25.14 permanece:
- um fechamento encerra apenas o turno corrente;
- outro turno pode começar no mesmo dia;
- o fechamento anterior é o corte entre turnos;
- somente comandas **abertas depois** desse corte entram no novo turno da mesma data;
- fechamentos anteriores permanecem imutáveis.

## A receber / Paga depois
A compatibilidade foi alinhada à mesma regra:
- a pendência recebe `businessDate` / `operationalDate` pela abertura da comanda;
- o `closedAt` real não é reescrito;
- a correção é sincronizada por `history_upsert` e `receivable_upsert` já existentes;
- nenhuma nova venda é criada na baixa posterior.

## Cliente rápido
O seletor pesquisável de clientes da v0.25.13 permanece ativo:
- busca por nome/WhatsApp;
- seleção reaproveita nome e WhatsApp cadastrados;
- digitação livre continua permitida;
- opt-in do WhatsApp continua manual.

## Backend
Sem nova migration, tabela, Edge Function ou tipo de evento nesta release. O backend atual permanece compatível.

## PWA
- `VERSION = 0.25.15`;
- cache `rota27-comandas-v0.25.15-r1`;
- Ajuda v6.6.

## Gates
- comanda aberta antes da meia-noite e fechada depois permanece na data de abertura;
- comanda aberta após um fechamento no mesmo dia pertence ao turno seguinte;
- comandas antigas sem movimento recente não assumem o turno atual;
- nenhum novo polling visual ou `MutationObserver` foi introduzido.

Baseline de rollback: **v0.25.14**.
