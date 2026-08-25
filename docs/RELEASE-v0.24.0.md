# Rota 27 v0.24.0 — Custos & Margem

Data de promoção: **25/08/2026**

## Resumo
A v0.24.0 acrescenta visão econômica operacional ao Rota 27 usando exclusivamente **custos reais de aquisição** informados no fluxo de Compras & Reposição.

A versão não transforma o produto em ERP, fiscal ou contabilidade e não tenta deduzir custo a partir do preço de venda.

## Entregas
- Central `Custos & Margem`;
- custo unitário previsto opcional na reposição;
- subtotal previsto por item;
- sugestão pelo último custo conhecido quando aplicável;
- custo real por item no recebimento;
- frete opcional;
- rateio proporcional do frete entre linhas com custo conhecido;
- custo efetivo unitário e total de aquisição;
- histórico de custos e CSV;
- margem unitária;
- margem bruta estimada;
- valor estimado do estoque conhecido;
- cobertura de custo;
- identificação explícita de produtos sem custo;
- acessos integrados a Compras & Reposição e Estoque Essencial;
- Ajuda v4.8;
- layout desktop/mobile;
- operação offline-first.

## Edição de rascunho
Durante o gate foi identificada uma lacuna operacional: pedidos em `draft` não eram editáveis.

A release inclui editor de rascunho com:
- quantidade;
- custo unitário previsto;
- fornecedor;
- adicionar/remover produtos;
- observação;
- recálculo de subtotal/total conhecido;
- sincronização da alteração por `purchase_order_upsert`.

Pedidos fora de `draft` não entram nesse editor.

## Identidade de versão
Foi corrigida a alternância visual do badge entre versões legadas durante o bootstrap.

A identidade pública permanece estável em `v0.24.0`, sem introduzir polling visual ou novo `MutationObserver`.

## Regra central
**Sem custo real registrado, o Rota 27 não inventa valor.**

Produtos sem custo ficam fora de margem e valorização de estoque conhecidas; o preço de venda nunca substitui custo.

## Fórmulas
- margem unitária = preço de venda atual − último custo efetivo real;
- margem bruta estimada % = margem unitária / preço de venda × 100;
- valor estimado do estoque = estoque físico atual × último custo efetivo real.

Os números são gerenciais e não incluem impostos, taxas de cartão, folha, perdas ou custos indiretos.

## Sincronização e backend
A v0.24 reutiliza os eventos existentes:
- `purchase_order_upsert`;
- `purchase_receipt`.

Não houve novo tipo de evento, tabela, migration ou nova versão da Edge Function.

Backend preservado:
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- `verify_jwt=false`;
- autenticação por `x-rota27-device-token`.

## Validação
Aprovado em desktop, celular e A→B.

O Supabase confirmou payloads com:
- `unitCostQuoted`;
- `unitCost`;
- `lineCost`;
- `freightCost`;
- `freightShare`;
- `effectiveLineCost`;
- `effectiveUnitCost`;
- `totalAcquisitionCost`;
- `costAppVersion = 0.24.0`;
- `editedAppVersion = 0.24.0`.

Exemplo validado:
- pedido `PC-260825-2VO6`;
- 5 unidades a R$ 2,50;
- frete R$ 2,50;
- total aquisição R$ 15,00;
- custo efetivo R$ 3,00/unidade.

## Estabilidade
Preservar a regra consolidada desde a v0.21:
- não adicionar polling visual frequente;
- não criar `MutationObserver` concorrente no Painel.

## Cache/PWA
Service Worker de produção da release:
`rota27-comandas-v0.24.0-r2`.

Atualização sem reinstalação e sem limpar dados.

## Rollback
Baseline anterior segura: **v0.23.0 — Inventário & Conferência**, incluindo o hotfix de schema da PR #29.

## Próximo passo
Não há v0.25 fechada automaticamente.

A decisão deve vir do uso real da v0.24, comparando principalmente:
- inteligência de giro/reposição;
- relacionamento/fidelização de clientes.
