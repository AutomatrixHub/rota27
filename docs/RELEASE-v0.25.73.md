# Rota 27 — Release v0.25.73

## Aviso de cancelamento por WhatsApp

Data: 30/08/2026

## Relato de produção
Uma comanda do cliente **Mamute** foi aberta no Balcão, recebeu 1x Cerveja Original 300ml e enviou corretamente a atualização Utility de **R$ 6,00** pelo WhatsApp. Em seguida, a comanda inteira foi cancelada, porém o cliente não recebeu correção nem aviso de cancelamento.

A auditoria no Supabase confirmou para a comanda `c1788116131924`:
- `command_opened`;
- `item_delta` +1 da Cerveja Original 300ml;
- `command_patch` com `cancelled=true`;
- no `whatsapp_message_log`, somente a mensagem inicial da comanda, posteriormente marcada como lida.

## Causa raiz
O fluxo legado de `v0151-hotfix.js` foi criado para impedir que envios pendentes sobrevivessem a uma comanda cancelada. Na confirmação ele:
1. marca a comanda como cancelada;
2. define `whatsappOptIn=false`;
3. limpa a fila normal `state.whatsappOutbox` daquela comanda;
4. sincroniza o `command_patch` de cancelamento;
5. remove a comanda da lista aberta.

A proteção operacional funcionava, mas eliminava qualquer possibilidade de comunicar ao cliente que a comanda inteira havia sido cancelada.

## Implementação v0.25.73
Novo asset: `assets/v02573-whatsapp-cancel.js`.

A camada escuta a confirmação de cancelamento em **capture phase**, antes do handler legado, e salva um snapshot suficiente para a comunicação. Ela não interfere no cancelamento operacional.

Se a comanda tiver:
- `whatsappOptIn=true`;
- telefone válido;
- um ou mais itens;

a camada cria uma fila própria de cancelamento, separada da `state.whatsappOutbox` que o fluxo antigo limpa.

## Mensagem ao cliente
A release reutiliza os templates Utility já aprovados:
- `atualizacao_comanda_rota27_mini2_1`;
- `atualizacao_comanda_rota27_mini2_2`;
- `atualizacao_comanda_rota27_mini2_3`;
- `atualizacao_comanda_rota27_mini2_4`;
- `atualizacao_comanda_rota27_mini2_5`.

O backend `rota27-whatsapp` já interpreta deltas negativos como `REMOVIDO`.

Exemplo esperado:

`Comanda: Balcão • CANCELADA`

`Olá, Mamute!`

`REMOVIDO: 1x Cerveja Original 300ml - R$ 6,00`

`Total atual: R$ 0,00`

`Obrigado - Rota 27 Bodega`

## Idempotência e offline
- `eventId` determinístico: `cancel_whatsapp_<commandId>`;
- o backend existente deduplica por `whatsapp_message_log.event_id`;
- a fila local de cancelamento é persistente;
- em falha/offline, usa backoff progressivo até 120 segundos;
- retoma em `online`, `pageshow` e retorno do app;
- não há polling contínuo nem `MutationObserver`.

## Confirmação visual
A folha **Cancelar comanda?** passa a esclarecer:
- os envios pendentes anteriores serão cancelados;
- quando a comanda é elegível, o cliente receberá um aviso de cancelamento com itens removidos e total R$ 0,00.

## Compatibilidade
Preservados:
- sincronização `command_patch` do cancelamento;
- auditoria operacional;
- exclusão da comanda do faturamento;
- estoque e demais regras atuais;
- WhatsApp agrupado normal;
- v0.25.72 do seletor de clientes/Painel;
- aniversários e campanhas existentes.

## Backend
Nenhuma Edge Function foi alterada. O `rota27-whatsapp` v23 já possui todo o suporte necessário a delta negativo, templates Utility e idempotência.

Nenhuma migration ou alteração de schema.

## Segurança
Nenhum WhatsApp real foi enviado durante a implantação/teste da release. Cancelamentos históricos anteriores não são reenviados retroativamente.

## PWA
- versão: `0.25.73`;
- cache: `rota27-comandas-v0.25.73-r1`;
- asset carregado diretamente no shell e também pelo roadmap loader.

## Rollback
Baseline: **v0.25.72**, merge `ea8800ec9f836f1d66dd9729ef871c425d141880`.
