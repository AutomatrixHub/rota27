# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.72 — Seletor persistente de clientes + Painel sem redundância
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.72-r1`
- **Baseline anterior:** v0.25.71

## v0.25.72 — Clientes e Painel

### Nova comanda — Nome do cliente
- o seletor antigo v0.25.13 entra em modo de compatibilidade e deixa de registrar listeners concorrentes;
- o campo `#newCustomer` rejeita novas tentativas de aplicar `list=v017ClientSuggestions` feitas pelo core legado;
- o seletor v0.25.71 permanece como a única lista visível;
- lista sincronizada, rolável por toque e selecionável por click;
- sem polling e sem `MutationObserver`.

### Painel — A Receber
- o card isolado **A receber** deixa de aparecer no Painel;
- o acesso permanece em **Hoje precisa de atenção** quando existem pendências;
- a ação de recebíveis recebe mais cor, contraste e destaque visual;
- saldos, vencimentos e sincronização de A Receber não mudam.

## v0.25.71 — Prioridade de categorias e clientes
- ordem fixa: **Todos → Cervejas → Bebidas → Charcutaria → Vinhos**;
- demais categorias do Cardápio em ordem alfabética;
- demais categorias do lançamento pela quantidade histórica vendida;
- seletor próprio de clientes sincronizados na Nova comanda.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles;
- nenhuma alteração no backend WhatsApp nesta release.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.72.md`
- `docs/RELEASE-v0.25.71.md`

## Versão
Produção: **0.25.72**
