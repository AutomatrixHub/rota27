# Rota 27 — Release v0.17.1

Data: 23/08/2026

## Objetivo

Consolidar a experiência v0.17 em uma patch release com documentação/Ajuda atualizadas, mensagens de WhatsApp no formato final aprovado e infraestrutura para encaminhar respostas dos clientes ao gerente.

## PWA

- versão pública: `0.17.1`;
- cache Service Worker: `rota27-comandas-v0.17.1`;
- `VERSION`: `0.17.1`;
- selo final: `assets/v017-final.js` atualizado para `v0.17.1`;
- novo complemento de Ajuda: `assets/v0171-help-update.js`.

## Ajuda v3

A Ajuda interna foi atualizada para incluir:

- clientes e autocomplete;
- cadastro manual e captura automática de cliente;
- importação/exportação de clientes;
- WhatsApp do cliente no formato `mini2_*`;
- WhatsApp do gerente;
- respostas de clientes encaminhadas ao gerente;
- novos cenários rápidos de suporte;
- sincronização de clientes/configuração do gerente;
- confirmação de que outboxes de WhatsApp permanecem locais.

## WhatsApp de atualizações

Backend de produção: `rota27-whatsapp` versão 23 / `rota27-whatsapp-v6-mini2`.

Templates aprovados:

- `atualizacao_comanda_rota27_mini2_1`;
- `atualizacao_comanda_rota27_mini2_2`;
- `atualizacao_comanda_rota27_mini2_3`;
- `atualizacao_comanda_rota27_mini2_4`;
- `atualizacao_comanda_rota27_mini2_5`.

Formato final:

- `Comanda: <local>`;
- `1x Produto - R$ ...` para inclusão;
- `REMOVIDO: 1x Produto - R$ ...` para retirada;
- até 5 alterações por mensagem;
- mudanças incrementais + total atual.

## Respostas dos clientes

Template aprovado:

- nome: `resposta_cliente_rota27_gerente_v1`;
- categoria: `UTILITY`;
- idioma: `pt_BR`;
- status: `APPROVED`.

Nova infraestrutura:

- tabela `public.rota27_whatsapp_inbound`;
- Edge Function `rota27-whatsapp-inbound` v1;
- correlação da resposta por `context.id` com a mensagem outbound real;
- confirmação do telefone do remetente contra a mensagem enviada ao cliente;
- resolução do gerente pela configuração sincronizada mais recente;
- idempotência por `meta_message_id`;
- bloqueio de loop se a origem for o próprio gerente;
- texto e interativos encaminhados; mídia representada por indicação segura do tipo.

## Segurança do inbound

O callback é público porque a Meta precisa alcançá-lo e, por isso, usa `verify_jwt=false`. Enquanto `META_APP_SECRET` não estiver configurado no runtime, o modo inicial é `context-bound`: somente uma mensagem com `context.id` que corresponda a um `wa_message_id` outbound do mesmo cliente pode gerar encaminhamento.

Nenhum App Secret ou access token é commitado.

## Ativação Meta

A API da Meta exige App Access Token/App Secret para registrar o webhook do app no objeto `whatsapp_business_account`, campo `messages`. O script:

`scripts/rota27-ativar-webhook-respostas.ps1`

faz essa ativação localmente sem gravar credenciais. Ele também vincula/confere a WABA e o callback da Edge Function.

## Atualização dos aparelhos

Não reinstalar a PWA e não limpar dados:

1. conectar à internet;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.17.1` e sincronização saudável.

## Rollback

- a família `mini_*` e os templates anteriores permanecem disponíveis na Meta para rollback;
- o backend outbound continua independente do inbound;
- se o webhook inbound for desabilitado, lançamento, fechamento, sync e envio de atualizações continuam funcionando normalmente.
