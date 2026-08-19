# Integração WhatsApp — Rota 27 v0.13

Arquitetura validada:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

## Agrupamento

O aplicativo faz debounce de aproximadamente **8 segundos**.

Exemplo:
- 1 IPA;
- 1 Torresmo;
- 1 Água.

Lançados em poucos segundos, esses itens resultam em uma única atualização agrupada para o cliente quando o lote possui até 5 itens.

A fila fica salva no `localStorage`. Se a rede falhar, o app tenta novamente sem desfazer os lançamentos da comanda.

## Templates dinâmicos

A Edge Function escolhe automaticamente o template conforme a quantidade de itens do lote:

- `atualizacao_comanda_rota27_v3_1` — 1 item;
- `atualizacao_comanda_rota27_v3_2` — 2 itens;
- `atualizacao_comanda_rota27_v3_3` — 3 itens;
- `atualizacao_comanda_rota27_v3_4` — 4 itens;
- `atualizacao_comanda_rota27_v3` — 5 itens.

Se o agrupamento tiver mais de 5 itens, a função divide o lote em blocos de até 5 e envia mensagens adicionais. Cada bloco recebe um `event_id` próprio derivado do evento principal para evitar duplicações em retries parciais.

## Formato da mensagem

Cada produto ocupa sua própria linha no WhatsApp, sem caracteres invisíveis e sem linhas vazias artificiais.

Exemplo:

```text
+ 1x IPA Capixaba 500ml - R$ 24,00
+ 1x Red Ale Artesanal 500ml - R$ 23,00
```

O total exibido é o **total acumulado da comanda naquele momento**, não apenas a soma dos itens da última atualização.

## Segurança

A PWA é pública no GitHub Pages, portanto:

- o `WHATSAPP_ACCESS_TOKEN` nunca é colocado no HTML;
- as credenciais da Meta ficam em Secrets do Supabase;
- cada aparelho autorizado recebe um `ROTA27_DEVICE_TOKEN`;
- o token do dispositivo é informado manualmente em **Cardápio → WhatsApp → Configurar**;
- o token do dispositivo fica apenas naquele navegador/aparelho;
- a Edge Function valida o header `x-rota27-device-token` antes de processar o envio.

## Secrets necessários no Supabase

- `ROTA27_DEVICE_TOKEN`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `META_GRAPH_VERSION`
- `WHATSAPP_TEMPLATE_LANG=pt_BR`

`WHATSAPP_TEMPLATE_NAME` deixou de ser necessário na v0.13, pois a Edge Function seleciona diretamente um dos cinco templates aprovados conforme a quantidade de itens.

## Banco

A migration cria `public.whatsapp_message_log`.

Ela é usada para:

- idempotência por `event_id`;
- histórico de sucesso/falha;
- armazenamento do `wamid` retornado pela Meta;
- diagnóstico;
- controle de blocos quando um lote possui mais de 5 itens.

RLS fica habilitado e nenhuma policy pública é criada.

## Edge Function

Slug:

`rota27-whatsapp`

Endpoint esperado:

`https://<PROJECT_REF>.supabase.co/functions/v1/rota27-whatsapp`

A função implementa autenticação própria com `x-rota27-device-token`. Por isso ela é implantada com:

```text
verify_jwt=false
```

Versão lógica atual da função:

```text
rota27-whatsapp-v3-dynamic
```

## Consentimento do cliente

Ao abrir ou editar uma comanda:

- informar o número de WhatsApp;
- marcar explicitamente a autorização;
- somente então os lançamentos serão enviados.

Alterações de quantidade e remoções também geram correções agrupadas para manter o acompanhamento da comanda consistente.

## Comportamento em falhas

Falhas no WhatsApp não cancelam nem desfazem lançamentos da comanda. O app mantém o lote na fila local e executa retry posteriormente.

A Edge Function registra erros da Meta em `whatsapp_message_log`, incluindo detalhes de diagnóstico quando disponíveis.
