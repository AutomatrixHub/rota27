# HANDOFF — Rota 27 Bodega — Comandas

Data: 24/08/2026

## 1. Baseline oficial
Produção oficial: **v0.23.0 — Inventário & Conferência**  
Branch de produção: `main`  
Repositório: `AutomatrixHub/rota27`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.23.0`

Backend Supabase:
- projeto `owkvwsiblbzlpxjwybrt`;
- `rota27-sync` versão **7 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- `verify_jwt=false` por autenticação própria via `x-rota27-device-token`;
- nenhuma migration nova na v0.23.0.

## 2. Forma de trabalho
- Não pedir edição manual de código ao usuário.
- Alterações não triviais: branch curta → PR draft → implementação → teste dirigido → ready/merge após validação.
- Não limpar `localStorage`.
- Não recomendar reinstalação da PWA como procedimento normal.
- Não expor tokens/secrets.
- Não sincronizar outbox do WhatsApp entre aparelhos.
- Estabilidade e velocidade operacional têm prioridade sobre complexidade.

## 3. Estado funcional consolidado
### Comandas
Abertura rápida, lançamento por produto/categoria/busca, edição, fechamento, pagamento, cancelamento, histórico e proteção contra duplicidade.

### Clientes e WhatsApp
Cadastro/importação/exportação, captura por nome + WhatsApp válido, templates mini2, inbound e outbox local por aparelho.

### Fechamento do Turno
Conferência, bloqueios, snapshot imutável, histórico e sincronização por `turn_closed`.

### Visão Gerencial
7/30/90 dias/todo histórico, faturamento, ticket, comandas, itens, cancelamentos, comparação, gráfico, produtos, pagamentos e CSV.

### Estoque Essencial
Controle opcional, inicial/mínimo, físico/comprometido/disponível, baixa no fechamento, movimentos Entrada/Venda/Perda/Consumo/Ajuste, histórico, CSV e multidispositivo.

### Compras & Reposição — v0.22
Fila automática, sugestão editável, fornecedor opcional, pedidos, recebimento parcial/total, Entrada idempotente no estoque, histórico, CSV e visão gerencial.

### Inventário & Conferência — v0.23
- uma conferência aberta por vez;
- snapshot do esperado;
- contagem mobile-first;
- diferença em tempo real;
- busca/filtros;
- pausar/continuar;
- nenhum saldo muda durante a contagem;
- bloqueio com item pendente;
- bloqueio se houver movimento de estoque depois do início;
- ajustes somente após confirmação;
- ID determinístico `inventory_adjust_<inventoryId>_<productId>`;
- histórico e CSV;
- indicador no Estoque Essencial;
- offline-first e multidispositivo.

## 4. Sync consolidado
Eventos incluem:
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
- `purchase_receipt`;
- `inventory_upsert`.

A v0.23 reutiliza `rota27_sync_events`; não há tabela nova.

## 5. Validação v0.23
Aprovada em desktop, celular e smoke A→B real.

Confirmado:
- sessão criada em A e recebida em B;
- contagens convergentes;
- pausa/continuação entre aparelhos;
- finalização convergente;
- saldo final igual;
- ajuste idempotente sem duplicidade relevante.

## 6. Compatibilidade interna
Por legado, `meta[name=rota27-version]` permanece em `0.22.0` como gate interno das camadas v0.21/v0.22. A release pública v0.23 é identificada por:
- arquivo `VERSION = 0.23.0`;
- `rota27-release-version = 0.23.0`;
- badge/título v0.23.0;
- Service Worker `rota27-comandas-v0.23.0`.

Não alterar esse mecanismo sem teste de regressão amplo.

## 7. Estabilidade do Painel
Não reintroduzir polling visual nem `MutationObserver` concorrente. A solução validada mantém observer restrito aos filhos diretos de `screenPanel`; Inventário não adiciona observer visual.

## 8. Severidade
- P0: perda/corrupção, cobrança errada, duplicação grave, indisponibilidade.
- P1: sync não converge, fluxo frequente impraticável, duplicidade operacional relevante.
- P2: melhorias gerenciais.
- P3: conveniência/refinamento.

## 9. Próxima versão
Direção aprovada: **v0.24.0 — Custos & Margem**.

Regra essencial: não usar preço de venda como custo. Registrar custo de aquisição real/estimado de forma explícita antes de calcular margem, CMV ou valor de estoque.

## 10. Primeiro procedimento no próximo ciclo
1. conferir `main`, `VERSION`, `sw.js`, README e STATUS;
2. conferir PRs/issues abertos;
3. conferir `rota27-sync` versão 7 ACTIVE;
4. confirmar produção v0.23.0;
5. somente então fechar o escopo detalhado da v0.24 e abrir branch/PR draft.
