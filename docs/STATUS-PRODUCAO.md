# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.11 — Rankings por Produto Atual**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.11-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.10 — Resumo por Produto Atual**.

## v0.25.11 — Produtos mais vendidos no Histórico
O quadro **Histórico & resultados → Produtos mais vendidos** passa a consolidar produtos por **ID/código**, assim como o resumo diário corrigido na v0.25.10.

Regras:
- nome exibido: cadastro atual quando o produto ainda existe;
- quantidade: histórico real das comandas fechadas;
- receita: preço histórico registrado em cada venda;
- fallback: nome histórico se o produto não existir mais no catálogo;
- comandas fechadas não são reescritas.

Isso faz correções de nome refletirem automaticamente nos dois rankings sem alterar os valores históricos.

## v0.25.10 preservado
O quadro **Mais vendidos hoje** permanece consolidando por ID e usando o nome atual do catálogo com receita histórica.

## v0.25.9 preservado
Permanece a limpeza controlada da comanda de teste `c1787598217117` e a lista somente leitura de produtos ao editar categorias.

## WhatsApp
Permanece ativa a cópia fixa de novos lançamentos para `+55 27 99776-9279` (`5527997769279`). O replay histórico continua hibernado.

## Backend e sincronização
A v0.25.11 não cria Edge Function, migration, tabela ou novo tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v6.2**, identificando Rota 27 v0.25.11.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.11`;
6. verificar em **Histórico & resultados → Produtos mais vendidos** que o nome atual do cadastro é exibido.

Ver `docs/RELEASE-v0.25.11.md`.
