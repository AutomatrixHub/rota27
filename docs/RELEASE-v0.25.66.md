# Release v0.25.66 — Elegibilidade de aniversário

Data: 29/08/2026

## Objetivo
Eliminar a ambiguidade sobre quais aniversariantes receberão parabéns e garantir que a data de nascimento conhecida pelo app seja a mesma conhecida pelo backend.

## Regra aprovada
Clientes que fornecem data de nascimento passam a receber autorização de relacionamento `true` no mesmo fluxo de cadastro.

Campos principais:
- `birthDate`;
- `relationshipMarketingOptIn=true`;
- `relationshipMarketingOptInAt`;
- `relationshipMarketingOptOutAt=0`;
- `relationshipMarketingConsentSource=birth_date_provided_v02566`;
- `eventMarketingOptIn=true` por compatibilidade com Eventos.

Um opt-out explícito posterior, sem nova alteração da data, continua sendo respeitado.

## Backfill de produção
Foi executado backfill append-only sobre os clientes com data de nascimento já registrada.

Resultado:
- **21 clientes** consolidados;
- 21 novos eventos `client_upsert`;
- nenhuma linha histórica apagada ou alterada in-place;
- nenhuma mensagem de WhatsApp enviada pelo backfill.

Entre os clientes consolidados estão **Cliente X** e **JJ Ivan Lins**, ambos com aniversário em 30/08 e WhatsApp válido.

## Correção de sincronização
A nova camada `v02566-birthday-eligibility.js` acompanha o save do cadastro. Quando uma data é fornecida pela primeira vez ou alterada, ela cria um `client_upsert` consolidado com data + autorização, mesmo que camadas antigas já tenham gravado a data apenas no armazenamento local.

## Interface
O card **Aniversários próximos** passa a informar:
- `Autorizado • 09h30 no dia`;
- `Sem autorização`;
- `Sem WhatsApp`.

A legenda antiga `Nenhuma mensagem é enviada automaticamente` é substituída por:

`Parabéns automático às 09:30 no dia do aniversário para clientes autorizados.`

No próprio dia continuam válidos os estados da v0.25.65: Agendado 09:30, Aceito pela Meta, Enviado, Entregue, Lido e Falhou.

## Backend preservado
- Edge Function: `rota27-birthday-greeting`;
- template: `aniversario_cliente_rota27_v1`;
- categoria: MARKETING;
- status Meta: APPROVED;
- cron: `rota27-birthday-greeting-0930`;
- horário: 09:30 `America/Sao_Paulo`;
- idempotência anual preservada.

## Arquivos
- `assets/v02566-birthday-eligibility.js`;
- `assets/v02566-birthday-eligibility.css`;
- `assets/roadmap-loader.js`;
- `index.html`;
- `sw.js`;
- `README.md`;
- `docs/STATUS-PRODUCAO.md`.
