# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção
- versão: **v0.22.0**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.22.0`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 6 ACTIVE** (`rota27-sync-v0.22.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.22.0 preserva a operação validada da v0.21.0 e acrescenta **Compras & Reposição**, além de uma revisão gerencial ampla do Estoque Essencial.

## Validação da v0.22.0
Em 24/08/2026 a candidata foi testada e aprovada para produção em desktop e aparelho móvel.

Foram validados durante o ciclo:
- estabilidade de Painel, Compras & Reposição e Estoque Essencial;
- fila automática de reposição;
- quantidade sugerida e editável;
- fornecedor opcional e fornecedor padrão por produto;
- criação de pedidos agrupados por fornecedor;
- estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimentos parciais e totais;
- controle de quantidade pendente;
- Entrada automática e idempotente no Estoque Essencial;
- histórico de compras/recebimentos;
- copiar pedido e CSV;
- visão gerencial ampliada de Compras;
- visão gerencial ampliada do Estoque Essencial;
- integração visual estoque ↔ pedido ↔ fornecedor;
- layout mobile de Compras;
- compactação mobile dos itens do estoque;
- ausência de rolagem horizontal relevante na operação móvel;
- regressões críticas preservadas em Comandas, Fechamento do Turno, Visão Gerencial, Modo demonstração e WhatsApp.

Baseline anterior de rollback: **v0.21.0**.

## Compras & Reposição
Disponível em `Painel → Compras & Reposição`.

Regras principais:
- fila derivada de produtos com controle de estoque ativo e `Disponível projetado <= Estoque mínimo`;
- sugestão atual: `max(0, estoque mínimo + 1 - disponível projetado)`;
- quantidade sugerida pode ser editada;
- fornecedor é opcional;
- nesta etapa, cada produto pode ter um fornecedor padrão;
- produtos selecionados são agrupados por fornecedor ao criar pedidos;
- pedido pode ser Rascunho, Enviado, Recebido ou Cancelado;
- recebimento pode ser parcial ou total;
- não é permitido receber acima do pendente;
- cada recebimento gera Entrada de estoque;
- movimento de entrada usa ID determinístico `purchase_entry_<receiptId>_<productId>` para evitar duplicidade;
- pedidos e recebimentos permanecem utilizáveis offline e sincronizam depois.

## Central gerencial de Compras
A visão superior mostra:
- produtos controlados, críticos e para repor;
- pedidos abertos;
- unidades pendentes/em pedido;
- unidades comprometidas em comandas;
- saúde do estoque;
- físico, comprometido e disponível projetado;
- prioridades e quantidade já em pedido;
- fluxo de compras e recebimentos recentes;
- progresso dos pedidos;
- cobertura de fornecedores.

Não há cálculo financeiro de compras/estoque nesta versão porque o catálogo possui preço de venda, não custo de aquisição confiável.

## Estoque Essencial
A base funcional da v0.21.0 permanece ativa:
- controle opcional por produto;
- estoque inicial e mínimo;
- saldo contabilizado = estoque inicial + movimentos imutáveis;
- itens em comandas abertas entram em `Comprometido`;
- `Disponível projetado = Estoque - Comprometido`;
- baixa de venda somente quando a comanda fecha;
- movimentos manuais: Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento manual que deixaria saldo negativo;
- bloqueio de lançamento de produto controlado quando o disponível chega a zero.

A v0.22.0 acrescenta visão gerencial com:
- indicadores de saúde;
- estoque físico, comprometido, disponível e em pedidos;
- fluxo diário de entradas, vendas, perdas/consumo e ajustes;
- prioridades;
- fornecedor e quantidade em pedido;
- últimas movimentações;
- ações rápidas para Configurar, Movimentar e abrir Compras & Reposição.

### Mobile do Estoque
Após teste em aparelho real:
- produtos sem controle não exibem mais cartões vazios;
- produtos controlados usam grade numérica compacta;
- `Configurar` e `Movimentar` permanecem táteis com menor altura;
- chip legado `ok` é ocultado no mobile para evitar duplicidade com `saudável`;
- a lista exige menos rolagem vertical.

## Sincronização
A v0.22.0 reutiliza `rota27_sync_events` e não cria tabela nova.

Eventos adicionados:
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Eventos de estoque continuam:
- `stock_config_upsert`;
- `stock_movement`.

A Edge Function `rota27-sync` está na **versão 6 ACTIVE** com `EDGE_VERSION = rota27-sync-v0.22.0` e `verify_jwt=false`, mantendo o mecanismo de autenticação por `x-rota27-device-token` já usado pelo produto.

Não houve migration nem alteração destrutiva.

## Estabilidade do Painel
A correção que estabilizou a v0.21.0 continua preservada:
- sem polling visual novo nas camadas gerenciais da v0.22;
- sem novo `MutationObserver` em Compras ou na nova visão do Estoque;
- permanece somente a compatibilidade restrita aos filhos diretos de `screenPanel`;
- a lógica funcional do estoque continua concentrada no módulo validado da v0.21.0.

## Visão Gerencial
Permanece ativa e validada:
- 7, 30, 90 dias e todo o histórico;
- faturamento, média por turno e ticket;
- comandas, itens e cancelamentos;
- comparação com período anterior;
- gráfico, melhor dia, produtos e formas de pagamento;
- CSV dos dados reais;
- Modo demonstração somente em memória e desligado por padrão.

## Fechamento do Turno e Auditoria
Permanecem ativos:
- conferência final;
- bloqueio com comandas abertas/pendências;
- snapshot imutável por data;
- histórico de fechamentos;
- bloqueio de novas comandas após fechamento do dia;
- sincronização por `turn_closed`;
- linha do tempo operacional da Auditoria.

## WhatsApp
Sem mudança funcional na v0.22.0:
- templates `atualizacao_comanda_rota27_mini2_1` a `_5`;
- template `resposta_cliente_rota27_gerente_v1`;
- inbound ativo;
- outbox de WhatsApp permanece local por aparelho e nunca é sincronizada.

## Ajuda v4.6
Inclui:
- Compras & Reposição;
- Estoque Essencial;
- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração;
- offline, sincronização, backup/restauração e atualização da PWA.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.22.0` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration destrutiva;
- operação local-first preservada;
- outbox do WhatsApp separada e local;
- Modo demonstração não persiste dados simulados.

## Próxima etapa
A próxima versão será definida a partir do uso real da v0.22.0. **Não há escopo de v0.23.0 fechado neste momento.**

Ver `docs/RELEASE-v0.22.0.md`.
