# Rota 27 — Release v0.22.0

Data: 24/08/2026

## Estado
**PRODUÇÃO — VALIDADA E AUTORIZADA**

A v0.22.0 foi testada em desktop e aparelho móvel e autorizada para promoção sobre a v0.21.0.

## Objetivo
Transformar os alertas do Estoque Essencial em uma rotina simples de **Compras & Reposição**, mantendo o Rota 27 rápido, local-first e sem virar um ERP pesado.

A versão também amadurece o Estoque Essencial com uma visão gerencial mais completa, preservando as regras de estoque já validadas na v0.21.0.

## Compras & Reposição
Acesso em `Painel → Compras & Reposição`.

Entregas:
- fila automática derivada de estoque mínimo e disponível projetado;
- quantidade sugerida e editável;
- fornecedor opcional e fornecedor padrão por produto;
- criação rápida de pedidos, agrupados por fornecedor;
- estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimento parcial ou total;
- controle de quantidade pendente;
- bloqueio de recebimento acima do pendente;
- Entrada automática no Estoque Essencial;
- idempotência de entrada por `purchase_entry_<receiptId>_<productId>`;
- histórico de pedidos e recebimentos;
- copiar pedido como texto simples;
- exportação CSV;
- funcionamento offline local;
- sincronização multidispositivo pelos eventos `supplier_upsert`, `purchase_order_upsert` e `purchase_receipt`.

## Central gerencial de Compras
A interface foi ampliada para mostrar contexto antes da ação:
- produtos controlados, críticos e para repor;
- pedidos abertos, unidades em pedido e comprometidas;
- barra de saúde do estoque;
- estoque físico, comprometido e disponível projetado;
- prioridades com mínimo, sugestão e quantidade já em pedido;
- fluxo de compras com rascunhos, enviados e recebimentos recentes;
- progresso de pedido: pedido, recebido, pendente e percentual;
- visão enriquecida de fornecedores.

## Estoque Essencial — revisão gerencial
A lógica da v0.21.0 permanece como fonte funcional para:
- estoque inicial e mínimo;
- saldo atual;
- comprometido em comandas abertas;
- disponível projetado;
- baixa apenas no fechamento;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de saldo negativo e de lançamento sem disponível.

A v0.22.0 acrescenta uma camada gerencial com:
- 6 indicadores principais;
- saúde do estoque;
- fluxo diário de entradas, vendas, perdas/consumo e ajustes;
- prioridades;
- quantidade já em pedido e fornecedor;
- últimas movimentações;
- atalhos para Configurar, Movimentar e Compras & Reposição.

## Refinamento mobile
Após teste em aparelho real, a lista do Estoque Essencial foi compactada:
- produtos sem controle não exibem cartões vazios;
- produtos controlados usam grade numérica compacta;
- botões permanecem adequados ao toque com menor altura;
- status redundante `ok` foi removido no mobile, mantendo o status v0.22;
- nenhuma rolagem horizontal foi introduzida.

Compras & Reposição também possui layout próprio para celular, com cartões empilhados, controles em largura adequada e operação sem depender de orientação horizontal.

## Backend
`rota27-sync` foi promovido para **versão 6 ACTIVE** com `EDGE_VERSION = rota27-sync-v0.22.0`.

Novos tipos permitidos:
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

O backend mantém todos os tipos anteriores, inclusive `stock_config_upsert` e `stock_movement`.

Não houve migration, tabela nova nem alteração destrutiva. Compras reutiliza `rota27_sync_events` e os contratos anteriores permanecem compatíveis.

## Preservações
A v0.22.0 não altera:
- cálculo financeiro da comanda;
- formas de pagamento;
- cancelamento;
- Fechamento do Turno;
- fonte de verdade da Visão Gerencial;
- Modo demonstração;
- WhatsApp cliente/gerente e inbound;
- outbox local de WhatsApp.

## Estabilidade
As revisões gerenciais da v0.22.0 não introduzem polling visual novo nem novo `MutationObserver`.

Permanece somente a camada de compatibilidade restrita ao `screenPanel`, seguindo a correção que estabilizou a v0.21.0.

## Ajuda
Ajuda atualizada para **v4.6**, incluindo Compras & Reposição e preservando Estoque Essencial, Fechamento do Turno, Visão Gerencial, Modo demonstração, offline, sincronização e atualização da PWA.

## Atualização da PWA
Não reinstalar e não limpar dados.

1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.22.0` e sincronização saudável.

## Rollback
Baseline anterior: **v0.21.0**.

O banco não recebeu migration na v0.22.0. Em caso de rollback de interface, a estrutura remota permanece compatível.

## Próxima etapa
A próxima versão será definida a partir do uso real da v0.22.0. Não há escopo de v0.23.0 fechado neste release.
