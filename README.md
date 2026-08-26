# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.10 — Resumo por Produto Atual**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.10-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.10 — Mais vendidos hoje
O quadro **Mais vendidos hoje** passa a agrupar vendas pelo **ID/código do produto**, e não pelo texto histórico do nome.

Regras:
- nome exibido: cadastro atual do produto;
- quantidade: comandas fechadas do dia;
- receita: preços históricos gravados em cada comanda;
- fallback: se o produto não existir mais no catálogo, usa o nome histórico da comanda.

Isso faz correções de nome refletirem automaticamente no resumo sem reescrever comandas fechadas nem alterar valores históricos.

## v0.25.9 preservado
Permanece a limpeza controlada da comanda de teste e a lista somente leitura de produtos ao editar categorias.

## Comandas — Lista + Mapa
Permanece a paridade visual da v0.25.6.

## WhatsApp
Permanece ativa a cópia fixa de novos lançamentos para `+55 27 99776-9279` (`5527997769279`). O replay histórico segue hibernado.

## Backend
A v0.25.10 não altera Supabase, Edge Functions, migrations ou tipos de evento.

## Ajuda
Ajuda **v6.1** identifica a release v0.25.10.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.10.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.9**.

## Versão
Produção: **0.25.10**
