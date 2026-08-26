# Rota 27 v0.25.9 — Limpeza de Produção & Referência de Categoria

Data: 25/08/2026

## Objetivos
1. Excluir de forma completa e controlada a comanda de teste usada acidentalmente em produção.
2. Mostrar os produtos de uma categoria como referência ao editar a categoria.

## Limpeza da comanda de teste
ID: `c1787598217117`

Identificação:
- Cliente: Mamute
- Local: Mesa 1
- Produto: Red Ale Artesanal 500ml
- Total: R$ 22,00
- Pagamento: Dinheiro
- Fechamento: 24/08/2026

### Remoto / Supabase
Foram removidos:
- `command_opened` da comanda;
- `item_delta` da comanda;
- `command_closed` da comanda;
- dois `client_upsert` contaminados pelo teste;
- registros de `whatsapp_message_log` ligados ao mesmo `command_id`.

O fechamento `turn_closed_2026-08-24` foi preservado, mas seu resumo foi corrigido para retirar a venda de teste:
- revenue: 0
- closedCount: 0
- avgTicket: 0
- units: 0
- products: []
- payments: []

Os campos de auditoria/cancelamento existentes foram preservados.

### Local / PWA
`assets/v0259-production-cleanup.js` protege os aparelhos contra resíduos locais e eventual reaparecimento da comanda. A rotina é idempotente e não usa polling.

Ela atua em:
- `state.commands`;
- `state.history`;
- outbox principal de sincronização;
- outbox de domínio contaminada;
- outbox da cópia fixa de WhatsApp;
- fechamento local de 24/08;
- `lastSeenAt` do cliente local, recalculado pelas comandas restantes.

## Referência de produtos ao editar categoria
Arquivos:
- `assets/v0259-category-reference.js`
- `assets/v0259-category-reference.css`

Ao abrir **Cardápio → Gerenciar categorias → Editar**, a folha de edição mostra os produtos da categoria em uma lista somente leitura com:
- nome;
- preço;
- status ativo/inativo.

Não há ação de edição nessa lista. A alteração de produto continua no fluxo normal do Cardápio.

## WhatsApp
A cópia fixa contínua para `+55 27 99776-9279` permanece ativa.

O replay histórico de 25/08 continua hibernado.

## Backend
Não houve nova migration, Edge Function, tabela ou tipo de evento.

## PWA
- `VERSION = 0.25.9`
- cache: `rota27-comandas-v0.25.9-r1`
- Ajuda: v6.0

## Rollback
Baseline: **v0.25.8 — Replay Hibernado**.

Observação: rollback do código não restaura os dados de teste removidos do Supabase.
