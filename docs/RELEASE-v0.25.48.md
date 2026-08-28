# Rota 27 — Release v0.25.48

Data: 28/08/2026

## Objetivo

Transformar o histórico de Eventos & Convites em um funil confiável de entrega, distinguindo claramente o aceite inicial da Meta dos callbacks assíncronos de envio, entrega, leitura e falha.

## Eventos & Convites — Entrega dos convites

Ao abrir uma campanha, o Rota 27 passa a mostrar:

- Registrados;
- Aceitos Meta;
- Enviados;
- Entregues;
- Lidos;
- Falharam.

A interface deixa explícito que **Aceito Meta não significa entregue**.

Quando houver falha confirmada, o detalhe por cliente pode mostrar código, título, mensagem e detalhes retornados no registro de entrega. Os detalhes ficam recolhidos por padrão para não transformar a tela em um console técnico.

## Backend somente de leitura

Foi adicionada a Edge Function:

- `rota27-event-delivery-status`;
- versão 1 ACTIVE;
- autenticação própria por `x-rota27-device-token`;
- `verify_jwt=false`, preservando o mesmo modelo de autenticação privada já usado pelo app.

A função:

- recebe apenas `eventId`;
- lê `whatsapp_message_log` da campanha `event_invite_v1`;
- interpreta `payload.delivery.status` gravado pelo inbound v0.25.43;
- não envia mensagens;
- não chama a Graph API da Meta;
- não insere, atualiza ou exclui registros.

O backend de envio `rota27-event-campaign` não foi alterado.

## Atualização de status

A tela possui atualização manual por `Atualizar entrega`.

Depois de um envio iniciado pelo usuário são feitas somente duas consultas finitas, aproximadamente 1,8 s e 5,5 s depois, para capturar callbacks iniciais. Não existe polling contínuo.

A retomada da aplicação também pode atualizar a leitura quando a tela da campanha estiver aberta.

## Interface

O fallback visual de evento sem imagem passa a usar ícone SVG de calendário no padrão Rota27, sem emoji.

## Preservações

Não altera:

- template de eventos;
- consentimento de marketing;
- proteção contra duplicidade;
- envio existente de convites;
- campanha de aniversários;
- inbound de respostas;
- sincronização;
- comandas, estoque, fechamento ou A Receber.

## PWA

- VERSION: 0.25.48
- cache: `rota27-comandas-v0.25.48-r1`

## Rollback

Baseline anterior: v0.25.47.

A Edge Function de leitura pode permanecer ativa em rollback do frontend, pois não executa mutações nem envio de WhatsApp.
