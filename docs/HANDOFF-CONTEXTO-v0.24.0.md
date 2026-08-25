# Handoff — Rota 27 v0.24.0

## Baseline oficial
Versão: **v0.24.0 — Custos & Margem**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.24.0-r2`  
Rollback: **v0.23.0**.

## Backend
Supabase: `owkvwsiblbzlpxjwybrt`.

`rota27-sync` permanece:
- versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- `verify_jwt=false`;
- autenticação por `x-rota27-device-token`.

A v0.24 não adiciona evento nem migration. Custos trafegam em:
- `purchase_order_upsert`;
- `purchase_receipt`.

Permanece aplicada a migration de constraint da v0.23:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Módulos operacionais
- Comandas;
- Clientes/WhatsApp;
- Fechamento do Turno/Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Custos & Margem
Regra inegociável:
**não inferir custo pelo preço de venda.**

Campos relevantes nos payloads:
- pedido: `unitCostQuoted`, `estimatedItemsCost`, `costedItems`, `costAppVersion`;
- recebimento: `unitCost`, `lineCost`, `freightCost`, `freightShare`, `effectiveLineCost`, `effectiveUnitCost`, `totalAcquisitionCost`, `costAppVersion`.

Margem:
- unitária = venda − custo efetivo;
- percentual = margem unitária / venda × 100.

Valor estimado de estoque:
- estoque físico × último custo efetivo real.

Produtos sem custo permanecem indisponíveis financeiramente, nunca como zero artificial.

## Rascunhos de pedido
Pedidos `draft` podem ser editados antes do envio:
- quantidade;
- custo previsto;
- fornecedor;
- itens;
- observação.

A edição gera/atualiza `purchase_order_upsert` e foi validada A→B.

## Identidade da release
O badge v0.24 foi estabilizado porque camadas legadas tentavam escrever versões antigas durante bootstrap.

Não resolver isso com polling ou observer concorrente. A solução v0.24 é visual/de release e mantém `v0.24.0` estável.

## Cuidado crítico de estabilidade
O Painel já sofreu cintilação/travamento por polling visual e `MutationObserver` concorrentes.

Preservar:
- sem polling visual frequente;
- sem múltiplos observers competindo;
- mudanças visuais devem preferir eventos existentes e atualizações pontuais.

## Validações da v0.24
Aprovado:
- desktop;
- celular;
- produto com custo conhecido;
- produto sem custo;
- custo/frete/custo efetivo;
- histórico e margem;
- badge de versão;
- edição de rascunho;
- A→B;
- comprovação dos campos de custo no Supabase.

## Próximo desenvolvimento
Não assumir automaticamente o próximo escopo.

Direções já consideradas:
1. inteligência de giro/reposição;
2. relacionamento/fidelização de clientes.

A escolha deve ser feita a partir do uso real da v0.24 e do maior ganho operacional percebido.
