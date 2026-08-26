# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.12 — Pendências / A Receber**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.12-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.12 — Pendências / A Receber
Ao fechar uma comanda, a forma **A receber / Paga depois** permite registrar a venda sem inventar um pagamento recebido.

Regras:
- a comanda sai das abertas e deixa de bloquear o fechamento do turno;
- a venda entra normalmente no Histórico e no faturamento;
- o valor vira uma pendência vinculada ao cliente e à comanda;
- pagamentos posteriores podem ser parciais ou totais;
- a baixa posterior não gera nova venda, não duplica itens nem faturamento;
- o Painel mostra o total em **A receber** e permite registrar a baixa;
- o fechamento do turno distingue **Recebido no turno** de **A receber** quando houver pendência;
- pendências e baixas sincronizam entre aparelhos.

## Sincronização
Novos tipos de evento:
- `receivable_upsert`
- `receivable_payment`

A Edge Function `rota27-sync` e o CHECK de `rota27_sync_events.event_type` foram atualizados em conjunto.

## Preservado
- rankings por ID/código com nome atual do produto;
- referência somente leitura de produtos ao editar categorias;
- paridade Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado.

## Ajuda
Ajuda **v6.3** identifica a release v0.25.12.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.12.md`
- `docs/PLANEJAMENTO-v0.25.12.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.11**.

## Versão
Produção: **0.25.12**
