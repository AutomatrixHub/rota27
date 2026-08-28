# Rota 27 v0.25.42 — Feedback de envio de convites

## Motivo

Durante o primeiro teste real do módulo Eventos & Convites, um cliente autorizado recebeu corretamente o convite, mas uma tentativa posterior de envio do mesmo evento exibiu o toast `0 convite(s) enviado(s).`.

O backend estava correto: a proteção contra duplicidade impediu novo disparo para quem já havia recebido. O contador do histórico mostrava 1 enviado, mas o texto do toast podia ser interpretado como falha.

## Correção

- mantém integralmente a proteção contra duplicidade;
- quando uma tentativa retorna zero novos envios sem falhas, o aplicativo passa a explicar que nenhum novo convite foi enviado porque destinatários que já receberam o evento não recebem novamente;
- não altera template, consentimento, segmentação, Edge Function nem logs existentes;
- cache PWA atualizado para `rota27-comandas-v0.25.42-r1`.

## Evidência do teste

O envio para o cliente de teste foi registrado como `sent` no `whatsapp_message_log`, com `attempts = 1` e `wa_message_id` da Meta. Portanto, houve um único envio real e nenhuma duplicação.

## Rollback

Retornar para v0.25.41 remove apenas o refinamento textual do feedback; a proteção de duplicidade continua no backend.
