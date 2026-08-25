# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.24.0 — Custos & Margem**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.24.0-r2`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.24.0 preserva a baseline funcional da v0.23.0 e acrescenta **Custos & Margem** sem transformar o Rota 27 em ERP, fiscal ou contabilidade.

Baseline de rollback: **v0.23.0 — Inventário & Conferência**.

## Validação da v0.24.0
Em 25/08/2026 a candidata foi testada e aprovada em desktop, celular e em dois aparelhos com sincronização A→B.

Foram validados:
- badge estável em `v0.24.0`;
- Central Custos & Margem em desktop e mobile;
- produto com custo conhecido calculando margem e valor de estoque;
- produto sem custo mantendo custo, margem e valor como indisponíveis;
- custo previsto opcional na reposição;
- custo real no recebimento;
- frete opcional e rateio proporcional;
- custo efetivo unitário e total de aquisição;
- histórico e CSV;
- edição de pedido em rascunho;
- alteração de quantidade, custo, fornecedor, produtos e observação;
- convergência A→B do pedido editado;
- convergência A→B de custos e histórico;
- nenhum custo inferido do preço de venda;
- ausência de regressão P0/P1 observada nos fluxos exercitados.

O log remoto confirmou payloads de compra com:
- `unitCostQuoted`;
- `unitCost`;
- `lineCost`;
- `freightCost`;
- `freightShare`;
- `effectiveLineCost`;
- `effectiveUnitCost`;
- `totalAcquisitionCost`;
- `costAppVersion = 0.24.0`.

Também foi confirmado `purchase_order_upsert` remoto após edição de rascunho, com `editedAppVersion = 0.24.0`.

## Custos & Margem
Acesso por Compras & Reposição ou Estoque Essencial.

Regra central:
**sem custo real registrado, o Rota 27 não inventa valor.**

Fórmulas:
- margem unitária = preço de venda atual − último custo efetivo real;
- margem bruta estimada % = margem unitária / preço de venda × 100;
- valor estimado do estoque = estoque físico × último custo efetivo real.

Os indicadores são gerenciais e não contábeis. Não incluem impostos, taxas de cartão, folha, perdas ou custos indiretos.

## Compras & Reposição
Além dos recursos anteriores, a v0.24 acrescenta:
- custo unitário previsto opcional;
- subtotal previsto conhecido;
- custo real no recebimento;
- frete opcional;
- custo efetivo;
- edição de pedidos enquanto estiverem em `draft`.

Pedidos enviados/recebidos/cancelados não entram no editor de rascunho.

## Estoque Essencial
Permanece com:
- controle opcional por produto;
- estoque inicial e mínimo;
- saldo por movimentos imutáveis;
- comprometido e disponível projetado;
- baixa de venda no fechamento;
- Entrada, Perda, Consumo interno e Ajuste;
- integração com Compras, Inventário e Custos & Margem.

## Inventário & Conferência
Permanece validado desde a v0.23:
- snapshot do saldo esperado;
- contagem rápida;
- pausar/continuar;
- proteção contra movimentação durante a conferência;
- ajustes somente após confirmação;
- sincronização por `inventory_upsert`.

## Backend e sincronização
A v0.24 **não exige nova Edge Function, evento, tabela ou migration**.

Reutiliza:
- `purchase_order_upsert`;
- `purchase_receipt`.

Os campos novos são transportados dentro dos payloads JSON já existentes.

A Edge Function `rota27-sync` permanece na **versão 7 ACTIVE**, `EDGE_VERSION = rota27-sync-v0.23.0`, `verify_jwt=false`, com autenticação própria por `x-rota27-device-token`.

Permanece aplicada a migration:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Estabilidade do Painel
A solução estabilizada desde a v0.21 continua preservada:
- sem polling visual frequente novo;
- sem novo `MutationObserver` concorrente;
- evitar qualquer camada que volte a competir pela renderização do Painel.

A correção do badge da v0.24 também não adiciona polling nem MutationObserver.

## WhatsApp
Sem mudança funcional na v0.24:
- templates mini2 preservados;
- inbound ativo;
- outbox permanece local por aparelho e nunca é sincronizada.

## Ajuda v4.8
Inclui Custos & Margem, além de Inventário, Estoque Essencial, Compras & Reposição e demais fluxos existentes.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.24.0` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration destrutiva na v0.24;
- operação local-first preservada;
- custo não é inferido de preço de venda;
- outbox do WhatsApp permanece local.

## Próxima etapa
O próximo escopo fica em aberto para ser escolhido pelo uso real da v0.24.

Direções candidatas já aprovadas para avaliação futura:
- inteligência de giro/reposição;
- relacionamento/fidelização de clientes.

Ver `docs/RELEASE-v0.24.0.md`.
