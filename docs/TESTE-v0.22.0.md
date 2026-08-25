# Rota 27 v0.22.0 — Validação de produção

Data de fechamento: 24/08/2026

## Estado
**APROVADA PARA PRODUÇÃO.**

PR: **#27 — Rota 27 v0.22.0 — Compras & Reposição**.

Baseline anterior: **v0.21.0 — Estoque Essencial**.

A aprovação foi dada após testes funcionais e visuais em desktop e aparelho móvel real, incluindo refinamentos de Compras & Reposição e Estoque Essencial.

## A — carregamento e estabilidade
Validado:
- interface abre em v0.22.0;
- Painel mantém `Visão Gerencial`, `Estoque Essencial` e `Compras & Reposição`;
- sem cintilação recorrente;
- sem travamento observado durante os testes dirigidos;
- navegação e retorno ao Painel preservados.

## B — fila de reposição
Validado:
- produto acima do mínimo não entra na fila;
- produto igual ou abaixo do mínimo entra automaticamente;
- `Disponível projetado` considera itens comprometidos em comandas abertas;
- quantidade sugerida segue `max(0, mínimo + 1 - disponível projetado)`;
- operador pode editar a sugestão antes de criar pedido.

Durante o teste foi identificado e corrigido um problema de compatibilidade entre o estado legado (`let state`) e a nova camada de Compras. A v0.22 usa uma ponte viva em `window.state`, sem duplicar o estado do aplicativo.

## C — fornecedores
Validado no fluxo local:
- cadastro leve de fornecedor;
- telefone/WhatsApp e observação opcionais;
- associação a produtos;
- fornecedor padrão por produto;
- produto sem fornecedor continua operável;
- fornecedor pode ser arquivado com `active=false`, preservando histórico.

## D — pedidos
Validado:
- criação a partir da fila de reposição;
- agrupamento por fornecedor;
- pedido nasce como `Rascunho`;
- transição para `Enviado`;
- cancelamento preserva histórico;
- copiar pedido gera texto simples e não dispara WhatsApp automaticamente;
- pedidos exibem pedido/recebido/pendente/progresso na visão gerencial.

## E — recebimentos e estoque
Validado:
- recebimento parcial;
- recebimento final;
- redução correta da pendência;
- bloqueio de quantidade acima do pendente;
- Entrada automática no Estoque Essencial;
- ID determinístico `purchase_entry_<receiptId>_<productId>`;
- reaplicação do mesmo receipt não duplica saldo;
- histórico de estoque preserva vendas, perdas, consumo, ajustes e entradas.

## F — operação offline
Arquitetura preservada como local-first:
- fornecedor, pedido e receipt são persistidos localmente antes da rede;
- recebimento aplica a Entrada localmente;
- outbox é enviada quando a conectividade e o backend estão disponíveis;
- falha de rede não deve bloquear a operação local.

## G — backend multidispositivo
Em 24/08/2026 o backend foi promovido antes do merge da interface:
- `rota27-sync` versão **6 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.22.0`;
- `verify_jwt=false`, preservando autenticação própria por token de dispositivo;
- novos tipos: `supplier_upsert`, `purchase_order_upsert`, `purchase_receipt`;
- eventos anteriores preservados;
- nenhuma migration ou tabela nova.

A publicação da Edge Function e o código implantado foram conferidos. No instante do fechamento deste documento ainda não havia evento de Compras registrado no log remoto, portanto a observação de um ciclo completo A→B entre dois aparelhos passa a ser **smoke operacional pós-rollout**, não uma alteração estrutural adicional.

Critério do smoke operacional:
- fornecedor criado/alterado em A aparece em B;
- pedido criado em A aparece uma única vez em B;
- receipt aparece uma única vez em B;
- Entrada de estoque converge uma única vez mesmo com `purchase_receipt` e `stock_movement` chegando em ordens diferentes;
- saldo final converge.

Se esse smoke revelar falha P0/P1, abrir hotfix imediatamente sem ampliar escopo.

## H — revisão gerencial de Compras
Aprovada após a primeira versão ter sido considerada simples demais.

A versão final inclui:
- 6 indicadores superiores;
- saúde do estoque;
- prioridades;
- estoque físico/comprometido/disponível;
- quantidade já em pedido;
- fluxo de compras;
- recebimentos recentes;
- progresso de pedidos;
- visão enriquecida de fornecedores.

## I — revisão gerencial do Estoque Essencial
Aprovada:
- indicadores de saúde;
- fluxo diário;
- prioridades;
- quantidade em pedido e fornecedor;
- últimas movimentações;
- ações rápidas;
- lógica funcional original da v0.21 preservada.

## J — mobile
Testado em aparelho real.

Compras:
- layout responsivo próprio;
- cartões empilhados;
- controles adequados à largura do aparelho;
- sem dependência de orientação horizontal.

Estoque:
- produtos sem controle não mostram cartões vazios;
- produtos controlados usam grade compacta;
- menor rolagem vertical;
- botões continuam confortáveis ao toque;
- status redundante `ok` removido no mobile.

## Regressões críticas a preservar em produção
- Comandas: abrir, lançar, editar, fechar, pagar e cancelar;
- Estoque: projeção, baixa no fechamento, movimentos e bloqueios;
- Fechamento do Turno: conferência, snapshot e bloqueios;
- Visão Gerencial e Modo demonstração;
- WhatsApp cliente/gerente e inbound;
- outbox do WhatsApp permanece local por aparelho.

## Resultado
**v0.22.0 autorizada para ready/merge e promoção em produção.**

Rollback funcional: **v0.21.0**.
