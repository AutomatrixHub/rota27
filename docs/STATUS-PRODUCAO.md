# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.12 — Pendências / A Receber**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.12-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 8 ACTIVE (`rota27-sync-v0.25.12`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.11 — Rankings por Produto Atual**.

## v0.25.12 — Pendências / A Receber
A forma **A receber / Paga depois** fecha a venda sem marcar pagamento recebido.

Comportamento:
- exige cliente identificado;
- fecha a comanda e remove o bloqueio do turno;
- registra a venda integralmente no Histórico/faturamento;
- cria pendência vinculada à comanda;
- aceita recebimentos parciais ou totais no Painel;
- baixa posterior não cria nova venda nem duplica itens/faturamento;
- o fechamento do turno exibe **Recebido no turno** e **A receber** quando houver pendência;
- card **A receber** no Painel mostra quantidade e saldo em aberto.

## Sincronização
Novos eventos:
- `receivable_upsert`;
- `receivable_payment`.

Backend atualizado em conjunto:
- `rota27-sync` versão 8 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.25.12`;
- migration `expand_rota27_sync_event_types_v02512` aplicada no Supabase;
- CHECK `rota27_sync_events_type_ck` ampliado para os dois novos tipos.

## Preservado
- rankings por ID/código com nome atual do produto;
- lista de referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- demais módulos de estoque, compras, inventário, custos e relacionamento.

## Ajuda
Ajuda **v6.3**, identificando Rota 27 v0.25.12.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.12`.

## Primeiro uso do caso real
Na comanda que ficou sem pagamento:
1. abrir a comanda;
2. fechar conta;
3. escolher **A receber / Paga depois**;
4. concluir;
5. abrir **Painel → A receber** para conferir a pendência;
6. fechar o turno normalmente.

Ver `docs/RELEASE-v0.25.12.md`.
