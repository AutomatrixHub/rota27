# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.23.0**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.23.0`

A v0.23.0 preserva Comandas, Estoque Essencial e Compras & Reposição e acrescenta **Inventário & Conferência**, fechando o ciclo entre saldo do sistema e contagem física real.

## Recursos principais

### Comandas
- abertura rápida por balcão, mesa, parklet e cliente;
- lançamento por toque, busca, categorias e Mais lançados;
- edição de itens, fechamento, pagamento e cancelamento seguro;
- proteção contra duplicidade acidental;
- produtos sem controle de estoque continuam operando normalmente.

### Estoque Essencial
Acesso em `Painel → Estoque Essencial`.

- controle opcional por produto;
- estoque inicial e mínimo;
- `Estoque`, `Comprometido` e `Disponível projetado`;
- baixa definitiva somente no fechamento da comanda;
- movimentos Entrada, Perda, Consumo interno e Ajuste;
- proteção contra saldo negativo e baixa duplicada;
- histórico e CSV;
- operação offline e multidispositivo;
- visão gerencial de saúde, físico, comprometido, disponível, pedidos e movimentações.

A fórmula do saldo permanece `estoque inicial + soma dos movimentos imutáveis`.

### Inventário & Conferência — v0.23.0
Acesso dentro do **Estoque Essencial**.

- uma conferência aberta por vez;
- somente produtos com controle de estoque ativo entram na contagem;
- snapshot do saldo esperado no início;
- contagem física rápida no celular;
- diferença em tempo real entre esperado e contado;
- atalhos `Igual ao sistema` e `Sem unidade`;
- busca, categoria, Pendentes e Divergentes;
- pausar e continuar depois, inclusive entre aparelhos;
- resumo de corretos, faltas e sobras;
- nenhum saldo muda durante a contagem;
- finalização bloqueada se houver item pendente;
- finalização bloqueada se o estoque se movimentar durante a conferência;
- somente divergências confirmadas geram movimentos `adjust`;
- idempotência por `inventory_adjust_<inventoryId>_<productId>`;
- histórico e CSV;
- indicador de última conferência / conferência em andamento dentro da Central do Estoque;
- offline-first e sincronização multidispositivo por `inventory_upsert`.

### Compras & Reposição — v0.22.0
Acesso em `Painel → Compras & Reposição`.

- fila automática por estoque mínimo/disponível projetado;
- sugestão de compra editável;
- fornecedor opcional e padrão por produto;
- pedidos agrupados por fornecedor;
- estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimento parcial/total;
- pendência por item;
- Entrada automática e idempotente no estoque;
- histórico, copiar pedido e CSV;
- visão gerencial de compras e fornecedores;
- offline-first e multidispositivo.

### Fechamento do Turno e Auditoria
- conferência e bloqueios;
- snapshot imutável por data;
- histórico de fechamentos;
- bloqueio de novas comandas após o encerramento;
- linha do tempo operacional da Auditoria;
- sincronização por `turn_closed`.

### Visão Gerencial
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento, média por turno, ticket, comandas, itens e cancelamentos;
- comparação com período anterior;
- gráfico, melhor dia, produtos e pagamentos;
- CSV;
- fonte de verdade baseada em fechamentos imutáveis.

### Modo demonstração
- desligado por padrão;
- dados simulados somente em memória;
- não persiste nem sincroniza;
- não altera dados reais.

### Clientes e WhatsApp
- cadastro/importação/exportação de clientes;
- captura automática quando há nome + WhatsApp válido;
- envio opcional mediante consentimento;
- templates mini2;
- inbound para respostas de clientes;
- outbox do WhatsApp local por aparelho e nunca sincronizada.

## Sincronização e offline
- local-first;
- comandas, histórico, cardápio, categorias, clientes, gerente, fechamentos, estoque, compras e inventários sincronizados entre aparelhos;
- eventos de estoque: `stock_config_upsert`, `stock_movement`;
- eventos de compras: `supplier_upsert`, `purchase_order_upsert`, `purchase_receipt`;
- evento de inventário: `inventory_upsert`;
- outbox/cursor/log remoto idempotente;
- operação continua disponível sem internet.

## Estabilidade do Painel
A correção introduzida na v0.21.0 permanece preservada. As camadas v0.22/v0.23 não adicionam polling visual nem novo `MutationObserver` concorrente; permanece somente a compatibilidade restrita aos filhos diretos de `screenPanel`.

## Tema e Ajuda
- operação em laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda **v4.7** inclui Inventário & Conferência além dos fluxos anteriores.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`), incluindo `inventory_upsert`;
- `rota27-audit`: versão 1 ACTIVE, somente leitura;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

A v0.23.0 não criou tabela nova. O inventário reutiliza `rota27_sync_events`; os ajustes físicos continuam usando `stock_movement`.

Após a promoção da v0.23.0, foi aplicado o hotfix de schema `20260825012842_expand_rota27_sync_event_types_v023`, que alinha o `CHECK rota27_sync_events_type_ck` à allowlist atual da Edge Function. O constraint agora aceita também `turn_closed`, os eventos de Estoque, Compras e `inventory_upsert`, preservando todos os tipos anteriores e sem alteração destrutiva de dados.

## Validação da v0.23.0
A candidata foi aprovada em desktop, celular e smoke multidispositivo A→B. Foram validados contagem, pausa/continuação, proteção contra estoque em movimento, finalização, idempotência, histórico, CSV e convergência entre aparelhos.

Após o hotfix do constraint, um smoke transacional confirmou a aceitação dos 7 tipos adicionados desde a v0.17, com rollback ao final do teste.

## Atualização da PWA
Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. manter internet ativa;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.23.0` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Segurança
- nenhum token/App Secret é versionado;
- nenhuma migration destrutiva;
- operação local-first preservada;
- outbox do WhatsApp permanece local;
- inventário não altera saldo antes da confirmação final.

## Próxima versão
Direção já aprovada: **v0.24.0 — Custos & Margem**. O escopo funcional detalhado deve ser fechado a partir do uso real da v0.23.0.

## Documentos principais
- `docs/RELEASE-v0.23.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.23.0.md`
- `docs/ESPEC-v0.23.0.md`
- `docs/HANDOFF-CONTEXTO-v0.23.0.md`
- `docs/PLANEJAMENTO-v0.24.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.23.0**
