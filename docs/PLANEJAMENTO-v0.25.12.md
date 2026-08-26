# Rota 27 v0.25.12 — Pendências / A Receber

## Objetivo
Permitir encerrar uma comanda quando o cliente paga depois, sem inventar pagamento e sem bloquear o fechamento do turno.

## Regras aprovadas
- nova opção `A receber / Paga depois` no fechamento da comanda;
- a venda entra normalmente no Histórico e no faturamento;
- quando a forma é `A receber`, não se confirma recebimento no ato;
- cria uma pendência vinculada à comanda e ao cliente;
- recebimentos posteriores podem ser parciais ou totais;
- recebimento posterior não gera nova venda, não altera itens vendidos e não duplica faturamento;
- pendências sincronizam entre aparelhos;
- fechamento do turno distingue faturamento, recebido e a receber;
- card `A receber` no Painel;
- sem polling visual novo e sem MutationObserver concorrente.

## Sincronização
Novos eventos:
- `receivable_upsert`
- `receivable_payment`

A Edge Function e o CHECK de `rota27_sync_events.event_type` devem aceitar ambos na mesma release.

## Persistência
- vendas permanecem em `state.history`;
- pendências ficam em armazenamento local próprio e são reconstruídas pelo log de sincronização;
- pagamentos posteriores são eventos append-only com ID idempotente.
