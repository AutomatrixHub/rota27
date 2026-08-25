# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.24.0 — Custos & Margem**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.24.0-r2`

A v0.24.0 preserva Comandas, Estoque Essencial, Compras & Reposição e Inventário & Conferência e acrescenta uma camada econômica operacional baseada em **custo real de aquisição**.

## Recursos principais

### Comandas
- abertura rápida por balcão, mesa, parklet e cliente;
- lançamento por toque, busca, categorias e Mais lançados;
- edição de itens, fechamento, pagamento e cancelamento seguro;
- proteção contra duplicidade acidental.

### Estoque Essencial
Acesso em `Painel → Estoque Essencial`.

- controle opcional por produto;
- estoque inicial e mínimo;
- Estoque, Comprometido e Disponível projetado;
- baixa definitiva no fechamento da comanda;
- Entrada, Perda, Consumo interno e Ajuste;
- integração com Compras & Reposição, Inventário e Custos & Margem;
- histórico, CSV, operação offline e multidispositivo;
- visão gerencial e layout mobile compacto.

### Inventário & Conferência — v0.23.0
- uma conferência aberta por vez;
- snapshot do saldo esperado;
- contagem física rápida no celular;
- diferença em tempo real;
- pausar/continuar;
- bloqueio se o estoque se movimentar durante a conferência;
- ajustes somente após revisão/finalização;
- idempotência por `inventory_adjust_<inventoryId>_<productId>`;
- histórico, CSV e sincronização por `inventory_upsert`.

### Compras & Reposição — v0.22+
- fila automática por estoque mínimo/disponível projetado;
- fornecedor opcional/padrão;
- pedidos Rascunho, Enviado, Recebido e Cancelado;
- recebimento parcial/total;
- Entrada automática idempotente no estoque;
- visão gerencial, histórico, copiar pedido e CSV;
- **rascunhos editáveis na v0.24**: quantidade, custo previsto, fornecedor, produtos e observação.

### Custos & Margem — v0.24.0
Acesso por **Compras & Reposição** ou **Estoque Essencial**.

- custo unitário previsto opcional na reposição;
- custo real por item no recebimento;
- frete opcional por recebimento;
- rateio proporcional do frete somente entre linhas com custo conhecido;
- custo efetivo unitário e total de aquisição;
- histórico de custos e CSV;
- margem unitária e **margem bruta estimada**;
- valor estimado do estoque somente sobre produtos com custo conhecido;
- cobertura de custo e produtos sem custo claramente identificados;
- nenhuma estimativa usa o preço de venda como substituto de custo.

Fórmulas principais:
- margem unitária = preço de venda atual − último custo efetivo real;
- margem bruta estimada % = margem unitária / preço de venda × 100;
- valor estimado do estoque = estoque físico atual × último custo efetivo real.

Esses indicadores são operacionais/gerenciais, não contábeis. Não incluem impostos, taxas de cartão, folha, perdas ou custos indiretos.

### Fechamento do Turno, Auditoria e Visão Gerencial
Permanecem preservados, incluindo snapshots imutáveis de fechamento, histórico, comparações, produtos, pagamentos e CSV.

### Clientes e WhatsApp
- cadastro/importação/exportação de clientes;
- captura automática quando há nome + WhatsApp válido;
- envio opcional mediante consentimento;
- inbound ativo;
- outbox do WhatsApp continua local por aparelho e não é sincronizada.

## Sincronização e offline
O Rota 27 permanece local-first e continua operando sem internet.

Eventos principais:
- Estoque: `stock_config_upsert`, `stock_movement`;
- Compras: `supplier_upsert`, `purchase_order_upsert`, `purchase_receipt`;
- Inventário: `inventory_upsert`.

A v0.24 **não cria novo tipo de evento, tabela ou migration**. Custos e edições de rascunho trafegam dentro de `purchase_order_upsert` e `purchase_receipt`.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`), suficiente para os payloads da v0.24;
- `rota27-audit`: versão 1 ACTIVE;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

Permanece aplicada a migration de segurança de schema da v0.23:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Validação da v0.24.0
A candidata foi aprovada em desktop, celular e A→B.

Foram validados:
- custo previsto no pedido;
- custo real e frete no recebimento;
- custo efetivo e histórico;
- margem e valor estimado do estoque;
- produto sem custo sem números artificiais;
- layout mobile;
- badge estável em `v0.24.0`;
- edição de rascunho e convergência entre aparelhos;
- payloads remotos com `unitCostQuoted`, `unitCost`, `freightCost`, `freightShare`, `effectiveUnitCost` e `totalAcquisitionCost`.

Baseline de rollback: **v0.23.0**.

## Estabilidade
A correção visual consolidada desde a v0.21 continua preservada: não adicionar polling visual frequente nem `MutationObserver` concorrente ao Painel.

## Tema e Ajuda
- operação em laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda **v4.8** inclui Custos & Margem e os fluxos anteriores.

## Atualização da PWA
Quem já possui o Rota 27 instalado não precisa reinstalar:
1. manter internet ativa;
2. abrir a PWA e aguardar 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.24.0` e sincronização saudável.

**Não limpar dados do navegador e não remover a PWA para atualizar.**

## Próxima etapa
O próximo escopo fica deliberadamente aberto para ser decidido pelo uso real da v0.24. As duas direções já identificadas são:
- inteligência de giro/reposição;
- relacionamento/fidelização de clientes.

## Documentos principais
- `docs/RELEASE-v0.24.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.24.0.md`
- `docs/ESPEC-v0.24.0.md`
- `docs/HANDOFF-CONTEXTO-v0.24.0.md`
- `docs/PLANEJAMENTO-v0.24.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.24.0**
