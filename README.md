# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.70 — Abertura canônica de Nova comanda
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.70-r1`
- **Baseline anterior:** v0.25.69

## v0.25.70 — Abertura canônica de Nova comanda

Corrige a regressão em que o botão `+` de **Comandas** podia mostrar **“Não foi possível abrir Nova comanda.”** quando `window.openNewCommandSheet` não estava exposta naquele ciclo do bootstrap/PWA.

### Correção
- `+` passa a usar uma abertura raiz/canônica;
- **Abrir primeira comanda** usa a mesma proteção;
- se a função legada estiver disponível, ela continua sendo aproveitada;
- se a referência global estiver ausente ou falhar, o formulário é aberto diretamente pelo DOM;
- campos de Nova comanda são reiniciados de forma segura;
- Consumo interno volta ao modo normal ao abrir uma nova comanda;
- permanece a regra de **não focar automaticamente** Mesa/Local ou qualquer outro campo;
- nenhuma rotina de polling ou `MutationObserver` foi adicionada.

## v0.25.69 — Organização do cardápio e categorias
- Cardápio administrativo em ordem alfabética;
- abas **Todos → Cervejas → Bebidas → demais categorias**;
- no lançamento, demais categorias ordenadas pela quantidade histórica vendida;
- Consumo interno/non-revenue fora desse ranking.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles;
- nenhuma alteração no backend WhatsApp nesta release.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas e histórico preservados.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.70.md`
- `docs/RELEASE-v0.25.69.md`

## Versão
Produção: **0.25.70**
