# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.73 — Aviso de cancelamento por WhatsApp**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.73-r1`;
- baseline anterior: **v0.25.72**, merge `ea8800ec9f836f1d66dd9729ef871c425d141880`.

## Cancelamento de comanda — WhatsApp
A auditoria de produção confirmou a lacuna: o cliente podia receber lançamentos da comanda, mas o cancelamento completo não gerava correção no WhatsApp.

Exemplo real auditado em 30/08/2026:
- cliente: Mamute;
- comanda: Balcão;
- evento `command_opened` seguido de `item_delta` para 1 Cerveja Original 300ml;
- mensagem Utility de R$ 6,00 enviada e lida;
- depois, `command_patch` com `cancelled=true`;
- nenhum segundo registro no `whatsapp_message_log` para informar o cancelamento.

Causa encontrada em `v0151-hotfix.js`: ao cancelar, a rotina desliga `whatsappOptIn` e limpa a fila normal de WhatsApp antes de remover a comanda, preservando apenas a sincronização operacional do cancelamento.

A v0.25.73 adiciona uma fila independente de aviso de cancelamento:
- captura a comanda antes da rotina legada limpá-la;
- exige opt-in da própria comanda, telefone válido e pelo menos um item;
- reutiliza os templates Utility `atualizacao_comanda_rota27_mini2_1..5`, já aprovados pela Meta;
- rótulo enviado: `<local> • CANCELADA`;
- todos os itens atuais são enviados com delta negativo e aparecem como `REMOVIDO`;
- total final enviado: **R$ 0,00**;
- `eventId=cancel_whatsapp_<commandId>` garante idempotência no backend existente;
- fila persiste offline e usa retry com backoff ao reconectar/retomar o app;
- cancelamentos anteriores à v0.25.73 não são reenviados retroativamente.

A confirmação de cancelamento também passa a informar quando haverá aviso ao cliente.

## Nova comanda — seletor de clientes
A v0.25.72 permanece responsável por manter o seletor sincronizado v0.25.71 como única lista visual da Nova comanda, impedindo a reincidência do datalist legado.

## Painel — A Receber
O card isolado de A Receber permanece oculto por redundância. Quando existem pendências, a ação fica em destaque dentro de **Hoje precisa de atenção**.

## Categorias preservadas
Ordem fixa:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. **Charcutaria**;
5. **Vinhos**.

No Cardápio, as demais categorias ficam alfabéticas. No lançamento, as demais continuam por consumo histórico faturável.

## Backend preservado
- `rota27-whatsapp`: v23 ACTIVE;
- `rota27-sync`: v9 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- `rota27-birthday-campaign`: v3 ACTIVE;
- parabéns automático às 09:30 preservado;
- solicitação de data de nascimento em até 3 tentativas / 7 dias preservada.

A v0.25.73 **não altera Edge Functions**, schemas ou tabelas. O backend WhatsApp atual já suporta delta negativo e idempotência por `event_id`.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- sem polling contínuo e sem `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.73`;
- `v02573-whatsapp-cancel.js` é carregado diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.73-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.72** / merge `ea8800ec9f836f1d66dd9729ef871c425d141880`.
