# Rota 27 Bodega — v0.25.43

## Status real de entrega do WhatsApp

### Motivo
Durante o primeiro teste real de Eventos & Convites, a Graph API aceitou o convite e devolveu um `wa_message_id`, mas o cliente informou que não recebeu a mensagem. A aplicação tratava a aceitação síncrona da API como `sent` e o webhook `rota27-whatsapp-inbound` ignorava os callbacks assíncronos presentes em `change.value.statuses`.

Isso impedia distinguir:
- requisição aceita pela Meta;
- mensagem entregue ao aparelho;
- mensagem lida;
- falha assíncrona de entrega.

### Correção
- `rota27-whatsapp-inbound` v3 passa a processar `statuses` além das mensagens recebidas;
- o retorno mais recente é preservado em `whatsapp_message_log.payload.delivery`;
- estados `sent`, `delivered` e `read` mantêm o registro operacional como enviado e preservam o estado exato em `payload.delivery.status`;
- estado `failed` altera o registro para `failed`, grava o motivo retornado pela Meta e libera nova tentativa pela proteção de duplicidade existente;
- erros de status registram código, título, mensagem e detalhes da Meta quando presentes;
- a tela de Eventos passa a chamar o contador de `aceitos Meta`, deixando claro que aceite não equivale a entrega;
- o toast de envio também deixa explícito que a confirmação de entrega ocorre posteriormente pelo WhatsApp.

### Caso Mamute
O envio original do evento foi aceito pela Graph API em 28/08/2026, mas não há callback histórico persistido porque a versão anterior descartava `statuses`. Como o cliente informou não recebimento, o registro foi marcado administrativamente como `reported_not_received`, sem atribuir à Meta um erro que não foi capturado. Isso o torna elegível a uma nova tentativa.

### Compatibilidade
- nenhuma alteração no schema do banco;
- respostas de clientes, captura de aniversário e encaminhamento ao gerente foram preservados;
- Sandbox continua bloqueando campanhas reais;
- nenhuma alteração de consentimento ou segmentação.

### Arquivos principais
- `supabase/functions/rota27-whatsapp-inbound/index.ts`
- `assets/v02543-whatsapp-delivery-status.js`
- `assets/v0256-release.js`
- `index.html`
- `sw.js`
- `VERSION`

### Cache PWA
`rota27-comandas-v0.25.43-r1`

### Rollback
Voltar para v0.25.42 / HEAD `af57754c4bb78dda978fed431e916c2eafc2b47d`. Em rollback, os callbacks de entrega voltam a não ser persistidos.
