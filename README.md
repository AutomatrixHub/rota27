# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.69 — Organização do cardápio e categorias
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.69-r1`
- **Baseline anterior:** v0.25.68

## v0.25.69 — Organização do cardápio e categorias

### Cardápio
- produtos exibidos em **ordem alfabética por nome**;
- filtro por abas/chips acima da lista;
- ordem das abas: **Todos → Cervejas → Bebidas → demais categorias em ordem alfabética**;
- busca continua funcionando junto com a categoria selecionada;
- produtos ativos e inativos continuam disponíveis para administração.

### Lançamento de produtos na comanda
A ordem das categorias passa a ser:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. demais categorias pela **quantidade histórica efetivamente vendida**, da maior para a menor;
5. empate sem consumo é resolvido alfabeticamente.

O cálculo usa unidades de comandas fechadas faturáveis. **Consumo interno / non-revenue não entra no ranking**. Quando disponível, a categoria é lida do snapshot do item registrado na própria comanda.

### Preservação
- nenhuma alteração de preço, produto, categoria ou histórico;
- nenhuma migration ou Edge Function;
- nenhuma rotina de polling adicionada;
- filtros são apenas de apresentação;
- a v0.25.68 permanece responsável pelo recontato de data de nascimento.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles;
- nenhuma alteração no backend WhatsApp nesta release.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.69.md`
- `docs/RELEASE-v0.25.68.md`

## Versão
Produção: **0.25.69**
