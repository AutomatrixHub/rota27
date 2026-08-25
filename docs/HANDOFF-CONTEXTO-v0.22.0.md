# HANDOFF — Rota 27 Bodega — Comandas

Data: 24/08/2026

## 1. Baseline oficial
Produção oficial: **v0.22.0 — Compras & Reposição**  
Branch de produção: `main`  
Repositório: `AutomatrixHub/rota27`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.22.0`

Backend Supabase:
- projeto `owkvwsiblbzlpxjwybrt`;
- `rota27-sync` versão **6 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.22.0`;
- `verify_jwt=false` porque a função usa autenticação própria por `x-rota27-device-token`;
- nenhuma migration nova na v0.22.0.

## 2. Forma de trabalho com o usuário
- O usuário não implementa nem edita código.
- Quando uma alteração estiver clara e aprovada, executar diretamente no GitHub conectado.
- Para software não trivial: branch curta → PR draft → implementação → teste dirigido → ready/merge após validação.
- Não pedir edição manual de arquivos.
- Não apagar `localStorage`.
- Não recomendar reinstalação da PWA como procedimento normal.
- Não solicitar, repetir ou expor tokens/secrets.
- Não sincronizar outbox do WhatsApp entre aparelhos.
- Estado saudável deve ser silencioso.
- Priorizar velocidade, prevenção de erro/perda/cobrança incorreta e simplicidade.
- Evitar refatoração de backend estável apenas por limpeza.

Clone Windows conhecido:
`C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git`

OneDrive já causou locks em `.git/objects`. Não fazer limpeza destrutiva de `.git/objects` e evitar `git reset --hard` sem necessidade.

## 3. Evolução consolidada
### Comandas
- abertura rápida por balcão, mesa, parklet e cliente;
- lançamento rápido, busca, categorias e mais lançados;
- edição de itens;
- fechamento/pagamento;
- cancelamento seguro;
- histórico e proteção contra duplicidade acidental.

### Clientes
- cadastro manual;
- captura automática por nome + WhatsApp válido;
- importação/exportação;
- autocomplete;
- sincronização multidispositivo.

### WhatsApp
- envio opcional mediante consentimento;
- templates mini2;
- inbound para respostas de clientes;
- outbox local por aparelho, nunca sincronizada.

### Fechamento do Turno
- conferência;
- bloqueios;
- snapshot imutável por data;
- histórico de fechamentos;
- bloqueio de novas comandas após o encerramento;
- sync por `turn_closed`.

### Visão Gerencial
- períodos de 7/30/90 dias e todo histórico;
- faturamento, média por turno, ticket, comandas, itens e cancelamentos;
- comparação com período anterior;
- gráfico, melhor dia, produtos e pagamentos;
- CSV;
- usa fechamentos imutáveis como fonte de verdade.

### Modo demonstração
- desligado por padrão;
- simulação somente em memória;
- não persiste, não sincroniza e não altera dados reais.

### Estoque Essencial
- controle opcional por produto;
- estoque inicial e mínimo;
- estoque físico, comprometido e disponível projetado;
- baixa somente ao fechar a comanda;
- movimentos Entrada, Venda, Perda, Consumo interno e Ajuste;
- proteção contra negativo e baixa duplicada;
- histórico, CSV, offline-first e multidispositivo.

### Compras & Reposição — v0.22.0
- fila automática por estoque mínimo/disponível projetado;
- sugestão editável;
- fornecedor opcional/padrão por produto;
- pedidos agrupados por fornecedor;
- estados Rascunho, Enviado, Recebido e Cancelado;
- recebimento parcial/total;
- pendência por item;
- Entrada automática e idempotente no estoque;
- histórico, copiar pedido e CSV;
- offline-first e multidispositivo.

Eventos novos:
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Não existe `supplier_delete`; arquivamento usa `active=false`.

## 4. Revisões gerenciais da v0.22.0
Compras & Reposição passou a exibir:
- 6 indicadores superiores;
- saúde do estoque;
- prioridades;
- físico/comprometido/disponível;
- quantidade em pedido;
- fluxo de compras;
- recebimentos recentes;
- progresso de pedidos;
- visão de fornecedores.

Estoque Essencial passou a exibir:
- indicadores de saúde;
- físico/comprometido/disponível/em pedido;
- fluxo diário de entradas, vendas, perdas/consumo e ajustes;
- prioridades;
- fornecedor;
- últimas movimentações;
- atalhos para Configurar, Movimentar e Compras.

## 5. Mobile
Compras possui layout responsivo próprio.

Estoque foi refinado após teste em aparelho real:
- produtos sem controle não mostram cartões vazios;
- itens controlados usam grade compacta;
- botões menores, ainda confortáveis ao toque;
- chip legado `ok` ocultado no mobile;
- menor rolagem vertical.

## 6. Incidente de estabilidade herdado da v0.21.0
Não reintroduzir polling visual nem `MutationObserver` concorrente.

A solução validada:
- observer restrito a `childList` dos filhos diretos de `screenPanel`;
- sem observer de subárvore autoalimentado;
- novas visões gerenciais da v0.22 não adicionam novos observers.

## 7. Backend e sync
Eventos consolidados incluem:
- `state_snapshot`;
- `command_opened`;
- `command_patch`;
- `item_delta`;
- `command_closed`;
- `history_upsert`;
- `catalog_upsert`;
- `catalog_delete`;
- `categories_replace`;
- `client_upsert`;
- `client_delete`;
- `manager_config_replace`;
- `turn_closed`;
- `stock_config_upsert`;
- `stock_movement`;
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

A v0.22.0 reutiliza `rota27_sync_events`; não houve migration/tabela nova.

No momento do fechamento do release, a Edge Function v6 estava ACTIVE e o código implantado foi conferido. Ainda não havia evento de Compras no log remoto após o deploy; um ciclo real A→B fica como smoke operacional pós-rollout. Se houver falha P0/P1 nesse smoke, abrir hotfix imediato.

## 8. Severidade
- **P0**: perda/corrupção de dados, total/cobrança errada, fechamento incorreto, duplicação grave, indisponibilidade geral.
- **P1**: sync não converge, cancelamento não propaga, WhatsApp duplica, fluxo frequente impraticável.
- **P2/P3**: refinamentos e melhorias não bloqueantes.

P0/P1: branch → PR draft → correção mínima → teste direcionado → merge após validação.

## 9. Próxima versão
**Não há escopo de v0.23.0 fechado.**

A próxima missão deve ser definida a partir do uso real da v0.22.0 e das prioridades do usuário.

## 10. Primeiro procedimento no próximo chat
Antes de qualquer alteração:
1. ler este handoff;
2. conferir `main`, `VERSION`, `sw.js`, `README.md` e `docs/STATUS-PRODUCAO.md`;
3. conferir PRs/issues abertos;
4. conferir `rota27-sync` no Supabase;
5. confirmar que produção continua v0.22.0;
6. somente então propor/abrir a próxima branch.
