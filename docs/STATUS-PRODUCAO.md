# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.10 — Resumo por Produto Atual**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.10-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.9 — Limpeza de Produção & Referência de Categoria**.

## v0.25.10 — Mais vendidos hoje
O resumo do turno passa a consolidar produtos por **ID/código**.

Regras:
- o nome exibido vem do cadastro atual quando o produto ainda existe;
- a quantidade vem das comandas fechadas do dia;
- a receita usa o preço histórico salvo em cada comanda;
- se o produto foi excluído do catálogo, o nome histórico vira fallback.

Isso evita fragmentação do ranking quando um produto é apenas renomeado e faz correções de digitação refletirem automaticamente no resumo gerencial.

## v0.25.9 preservado
Permanece a limpeza controlada da comanda de teste `c1787598217117` e a lista somente leitura de produtos ao editar categorias.

## WhatsApp
Permanece ativa a cópia fixa de novos lançamentos para `+55 27 99776-9279` (`5527997769279`). O replay histórico continua hibernado.

## Backend e sincronização
A v0.25.10 não cria Edge Function, migration, tabela ou novo tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v6.1**, identificando Rota 27 v0.25.10.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.10`;
6. verificar em **Histórico → Resumo do turno → Mais vendidos hoje** que o nome atual do cadastro é exibido.

Ver `docs/RELEASE-v0.25.10.md`.
