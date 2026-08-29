# Rota 27 — Release v0.25.58

Data: 29/08/2026

## Objetivo

Adicionar vencimento opcional às pendências de **A Receber** sem transformar o módulo em agenda ou cobrança complexa.

## Vencimento rápido

Ao fechar uma comanda como **A receber / Paga depois**, o usuário pode escolher:

- Sem data;
- Hoje;
- Amanhã;
- 7 dias.

O padrão continua **Sem data**. Portanto, o fluxo antigo permanece com a mesma quantidade de ações quando o usuário não quiser informar vencimento.

## Depois do fechamento

Na tela **A Receber**, a data pode ser ajustada posteriormente pelos mesmos quatro atalhos.

As pendências são apresentadas na ordem:

1. vencidas;
2. vencem hoje;
3. futuras;
4. sem data.

Vencidas e vencimentos do dia recebem destaque visual.

## Painel

O resumo de A Receber passa a priorizar:

- quantidade e valor vencidos;
- quando não houver vencidas, quantidade e valor que vencem hoje;
- caso contrário, mantém o resumo geral já existente.

## Sincronização

O campo `dueDate` é enviado usando o evento já existente `receivable_upsert`.

Não há:

- novo tipo de evento;
- migration;
- nova Edge Function;
- cobrança automática;
- envio automático de WhatsApp.

## Implementação

Novos assets:

- `assets/v02558-receivables-due-date.css`;
- `assets/v02558-receivables-due-date.js`.

A camada reaproveita a API `window.Rota27V02512` e o outbox existente de recebíveis.

Sem polling contínuo e sem MutationObserver.

## PWA

- VERSION: `0.25.58`;
- cache: `rota27-comandas-v0.25.58-r1`.

## Rollback

Baseline anterior: **v0.25.57** / merge `5f3a23c9423cf1604e6a4861e91a263b76f67db2`.
