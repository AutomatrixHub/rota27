# Rota 27 v0.25.40 — Eventos & Convites

## Objetivo
Adicionar uma primeira versão operacional para divulgar eventos do Rota 27 aos clientes pelo WhatsApp, com consentimento específico para marketing/eventos e sem reutilizar silenciosamente o consentimento transacional da comanda.

## Interface
Em **Clientes** passa a existir o card **Eventos & Convites**.

O módulo permite:
- cadastrar título do evento;
- informar data e horário;
- registrar descrição e chamada curta;
- anexar uma imagem do convite para prévia local;
- editar, excluir e reutilizar o cadastro do evento;
- escolher o público por segmento;
- selecionar ou retirar clientes individualmente;
- consultar a situação do template da Meta;
- confirmar e enviar a campanha;
- acompanhar enviados e falhas por evento.

## Segmentação disponível
- Todos autorizados;
- Recorrentes — 2+ compras;
- Frequentes — 5+ compras;
- Sem voltar há 30+ dias.

A segmentação é calculada no aparelho a partir do histórico local do cliente. Antes do envio, a Edge Function volta a validar telefone e consentimento.

## Consentimento de marketing
O editor de cliente recebe o campo:
**Autoriza convites e novidades pelo WhatsApp**.

Esse consentimento é separado do opt-in usado nas mensagens da comanda. O operador deve marcar somente quando o cliente autorizou divulgação de eventos e novidades.

A autorização é mantida em uma store local própria e também registrada no fluxo existente de `client_upsert`, usando campos adicionais no payload do cliente:
- `eventMarketingOptIn`;
- `eventMarketingOptInAt`;
- `eventMarketingOptOutAt`;
- `eventMarketingConsentSource`.

Não foi criado novo tipo de evento de sincronização nem migration de banco.

## Backend
Nova Edge Function:
`rota27-event-campaign`

Versão inicial:
`rota27-event-campaign-v1`

Ações:
- `consents` — consolida o consentimento de marketing dos clientes;
- `status` — consulta template, público elegível e histórico do evento;
- `submit_template` — solicita o template à Meta;
- `send_campaign` — envia a campanha confirmada.

Autenticação preserva o padrão administrativo atual com `x-rota27-device-token`.

## Template Meta
Nome:
`convite_evento_rota27_v1`

Idioma:
`pt_BR`

Categoria:
`MARKETING`

Corpo genérico:
`Olá, {{1}}! A Rota 27 Bodega te convida para {{2}}. {{3}}. {{4}}`

Variáveis:
1. nome do cliente;
2. título do evento;
3. data e horário;
4. chamada curta do evento.

O envio fica bloqueado enquanto o template não estiver `APPROVED`.

## Imagem do convite
Nesta primeira versão a imagem é usada como **prévia dentro do Rota 27**. Ela é redimensionada e compactada no navegador e fica armazenada localmente junto ao evento.

Ela **não é enviada como header do template do WhatsApp** nesta release. Isso foi deliberado para não improvisar upload/handle de mídia da Meta sem o fluxo específico de media template já validado.

## Histórico e duplicidade
Cada destinatário gera `event_id` no formato:
`event_invite_v1::<eventId>::<clientId>`

O backend usa `whatsapp_message_log` e não repete o mesmo convite para um cliente que já recebeu aquele evento com status `sent`.

## Sandbox
Quando o marcador de Sandbox está ativo:
- cadastro e prévia de eventos continuam disponíveis;
- consultas à campanha não são executadas;
- solicitação de template é bloqueada;
- disparo de WhatsApp é bloqueado.

A proteção de rede da v0.25.38 continua ativa como segunda barreira.

## PWA
- `VERSION`: `0.25.40`
- Service Worker: `rota27-comandas-v0.25.40-r1`

## Backend / banco
Não há migration, nova constraint ou novo `event_type` no `rota27_sync_events`.

## Rollback
Baseline anterior: v0.25.39 / commit `9b74dbda4136f6c52ff5fdfeadb4d7136a98f24c`.
