# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.11 — Rankings por Produto Atual**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.11-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.11 — Produtos mais vendidos
Além do **Mais vendidos hoje**, o quadro **Histórico & resultados → Produtos mais vendidos** passa a agrupar vendas pelo **ID/código do produto** e exibir o **nome atual do cadastro**.

Regras:
- nome exibido: cadastro atual;
- quantidade: histórico real;
- receita: preços históricos gravados em cada comanda;
- fallback: nome histórico se o produto não existir mais no catálogo;
- comandas fechadas não são reescritas.

Assim, correções de nome refletem automaticamente nos rankings sem alterar valores históricos.

## Preservado
- referência somente leitura de produtos ao editar categorias;
- paridade Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado.

## Backend
A v0.25.11 não altera Supabase, Edge Functions, migrations ou tipos de evento.

## Ajuda
Ajuda **v6.2** identifica a release v0.25.11.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.11.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback: **v0.25.10**.

## Versão
Produção: **0.25.11**
