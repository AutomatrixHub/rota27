# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.73 — Aviso de cancelamento por WhatsApp
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.73-r1`
- **Baseline anterior:** v0.25.72

## v0.25.73 — Cancelamento + WhatsApp

### Problema corrigido
O fluxo legado de **Cancelar comanda** desligava `whatsappOptIn` e removia a fila de WhatsApp antes de sincronizar `cancelled=true`. Assim, o cliente podia receber os lançamentos da comanda e não receber nenhuma correção quando a comanda inteira era cancelada.

### Comportamento novo
- ao confirmar o cancelamento, a v0.25.73 captura um snapshot da comanda **antes** da rotina legada apagar a fila;
- se havia autorização de WhatsApp, telefone válido e itens na comanda, cria uma fila de cancelamento independente;
- usa os templates Utility de atualização de comanda já aprovados pela Meta;
- a comanda é identificada como **CANCELADA**;
- todos os itens atuais são enviados como **REMOVIDO**;
- o total informado ao cliente é **R$ 0,00**;
- `eventId` determinístico torna o envio idempotente;
- se o aparelho estiver offline ou a chamada falhar, o aviso fica persistido e tenta novamente ao reconectar/retomar o app;
- o cancelamento operacional e sua sincronização continuam usando o fluxo existente.

Exemplo esperado:

`Comanda: Balcão • CANCELADA`

`REMOVIDO: 1x Cerveja Original 300ml - R$ 6,00`

`Total atual: R$ 0,00`

## v0.25.72 — Clientes e Painel
- seletor antigo de clientes desativado nas releases atuais;
- seletor sincronizado/rolável permanece como fonte única da Nova comanda;
- card isolado **A receber** removido do Painel;
- pendências de recebíveis destacadas em **Hoje precisa de atenção**.

## v0.25.71 — Prioridade de categorias e clientes
- ordem fixa: **Todos → Cervejas → Bebidas → Charcutaria → Vinhos**;
- demais categorias do Cardápio em ordem alfabética;
- demais categorias do lançamento pela quantidade histórica vendida;
- seletor próprio de clientes sincronizados na Nova comanda.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada nesta release;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- cancelamentos já existentes não são reenviados retroativamente.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.73.md`
- `docs/RELEASE-v0.25.72.md`

## Versão
Produção: **0.25.73**
