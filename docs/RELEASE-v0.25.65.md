# Release v0.25.65 — Parabéns automático de aniversário

Data: 29/08/2026

## Objetivo
Enviar automaticamente uma mensagem simples de feliz aniversário pelo WhatsApp, sem mimo, desconto, cupom ou oferta comercial.

## Template
- nome: `aniversario_cliente_rota27_v1`
- categoria: `MARKETING`
- idioma: `pt_BR`
- texto: `Olá, {{1}}! A equipe da Rota 27 Bodega deseja a você um feliz aniversário, com muita saúde, alegria e bons momentos. Parabéns pelo seu dia!`
- submissão inicial: `PENDING`
- id Meta retornado: `2886374555032299`

A automação só envia após o template ficar `APPROVED`.

## Consentimento
Novo consentimento de relacionamento no editor de Clientes:

**Receber mensagens da Rota 27 pelo WhatsApp**

Abrange aniversário, eventos e relacionamento. Continua separado do consentimento de atualizações operacionais da comanda.

Persistência backend:
- `relationshipMarketingOptIn`
- `relationshipMarketingOptInAt`
- `relationshipMarketingOptOutAt`
- `relationshipMarketingConsentSource`

Compatibilidade com Eventos é mantida também pelos campos `eventMarketingOptIn*` para novos consentimentos.

## Automação 09:30
Nova Edge Function `rota27-birthday-greeting` e migration `birthday_greeting_cron_0930`.

Cron:
- nome: `rota27-birthday-greeting-0930`
- expressão: `30 12 * * *` UTC
- horário operacional: 09:30 em `America/Sao_Paulo`

Antes de qualquer envio, o backend revalida:
1. horário local dentro da janela 09:30–09:45;
2. aniversário no dia corrente;
3. telefone WhatsApp válido;
4. consentimento explícito de relacionamento;
5. template Meta `APPROVED`;
6. ausência de envio bem-sucedido para o mesmo cliente no mesmo ano.

Idempotência: `birthday_greeting_v1::<ano>::<clientId>`.

## Status de entrega
Os envios usam `whatsapp_message_log`. O webhook existente continua atualizando estados por `wa_message_id`, permitindo mostrar:
- Agendado 09:30
- Aceito pela Meta
- Enviado
- Entregue
- Lido
- Falhou
- Sem autorização

Não há polling contínuo; o status é consultado ao abrir Clientes e pelo botão Atualizar.

## Segurança operacional
- Sandbox nunca envia;
- nenhuma mensagem é enviada se o template não estiver aprovado;
- não existe fallback por texto livre;
- nenhum cliente com consentimento antigo somente de Eventos é usado para aniversário sem nova confirmação do consentimento genérico;
- nenhuma mensagem real foi enviada durante a implantação.

## Arquivos principais
- `assets/v02565-birthday-greeting.js`
- `assets/v02565-birthday-greeting.css`
- `supabase/functions/rota27-birthday-greeting/index.ts`
- `supabase/migrations/20260830001500_birthday_greeting_cron.sql`

## Backend aplicado antes da promoção frontend
- Edge Function `rota27-birthday-greeting`: ACTIVE;
- `pg_cron` + `pg_net`: habilitados;
- job `rota27-birthday-greeting-0930`: ativo;
- template submetido à Meta e inicialmente PENDING.
