# Integração WhatsApp — Rota 27 v0.12

Arquitetura:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

## Agrupamento

O aplicativo faz debounce de aproximadamente **8 segundos**.

Exemplo:
- 1 IPA
- 1 Torresmo
- 1 Água

lançados em poucos segundos resultam em **uma única chamada** à Edge Function e uma única atualização para o cliente.

A fila fica salva no `localStorage`. Se a rede falhar, o app tenta novamente sem desfazer os lançamentos da comanda.

## Segurança

A PWA é pública no GitHub Pages, portanto:
- o `WHATSAPP_ACCESS_TOKEN` nunca é colocado no HTML;
- as credenciais da Meta ficam em Secrets do Supabase;
- cada aparelho da equipe recebe um `ROTA27_DEVICE_TOKEN`;
- o token do dispositivo é informado manualmente em **Cardápio → WhatsApp → Configurar**;
- o token do dispositivo fica apenas naquele navegador/aparelho.

## Secrets necessários no Supabase

- `ROTA27_DEVICE_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `META_GRAPH_VERSION`
- `WHATSAPP_TEMPLATE_NAME=atualizacao_comanda_rota27`
- `WHATSAPP_TEMPLATE_LANG=pt_BR`

## Banco

A migration cria `public.whatsapp_message_log`.

Ela é usada para:
- idempotência por `event_id`;
- histórico de sucesso/falha;
- armazenamento do `wamid` retornado pela Meta;
- diagnóstico.

RLS fica habilitado e nenhuma policy pública é criada.

## Edge Function

Slug:

`rota27-whatsapp`

Endpoint esperado:

`https://<PROJECT_REF>.supabase.co/functions/v1/rota27-whatsapp`

A função implementa autenticação própria com `x-rota27-device-token`.
Por isso ela deve ser implantada com `verify_jwt=false`.

## Comanda

Ao abrir/editar uma comanda:
- informar WhatsApp;
- marcar explicitamente a autorização;
- só então os lançamentos serão enviados.

Alterações de quantidade e remoções também geram correções agrupadas para que o total acompanhado pelo cliente não fique inconsistente.
