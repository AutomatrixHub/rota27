# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.71 — Prioridade de categorias e seletor real de clientes
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.71-r1`
- **Baseline anterior:** v0.25.70

## v0.25.71 — Prioridade de categorias e clientes

### Categorias
- ordem fixa: **Todos → Cervejas → Bebidas → Charcutaria → Vinhos**;
- no Cardápio, demais categorias continuam em ordem alfabética;
- no lançamento da comanda, demais categorias continuam pela quantidade histórica vendida;
- Consumo interno/non-revenue não entra no ranking;
- alias `Carchutaria` é reconhecido sem renomear dados existentes.

### Nova comanda — Nome do cliente
- remove o `<datalist>` nativo que concorria com o seletor do Rota27;
- atualiza o domínio de clientes ao focar o campo;
- usa os clientes sincronizados do Rota27;
- deduplica por WhatsApp/ID;
- painel próprio rolável por toque;
- seleção por toque/click sem bloquear a rolagem;
- nome e WhatsApp continuam preenchidos ao selecionar um cliente.

## v0.25.70 — Abertura canônica de Nova comanda
- `+` e **Abrir primeira comanda** usam abertura raiz;
- fallback direto no DOM quando a referência global legada não está disponível;
- nenhum campo recebe foco automático.

## Aniversários e relacionamento
- parabéns automático às 09:30 permanece ativo;
- solicitação de data de nascimento permanece limitada a 3 envios bem-sucedidos com 7 dias entre eles;
- nenhuma alteração no backend WhatsApp nesta release.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes e histórico preservados.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.71.md`
- `docs/RELEASE-v0.25.70.md`

## Versão
Produção: **0.25.71**
