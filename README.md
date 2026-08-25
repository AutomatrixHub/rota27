# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.22.0**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.22.0`

A v0.22.0 preserva a operação validada da v0.21.0 e acrescenta **Compras & Reposição**, integrada ao Estoque Essencial. Também amplia a visão gerencial do estoque e refina o uso em celular.

## Recursos principais

### Comandas
- abertura por Balcão, Mesa 1–5, Parklet 1–6 e nome do cliente;
- lançamento rápido por toque, busca, categorias e Mais lançados;
- consulta `Ver itens`, correção em `Editar itens`, fechamento com forma de pagamento e cancelamento seguro;
- proteção contra duplicidade acidental;
- produtos sem controle de estoque continuam operando como antes.

### Estoque Essencial
Acesso em `Painel → Estoque Essencial`.

- controle opcional por produto;
- estoque inicial e mínimo;
- `Estoque`, `Comprometido` e `Disponível projetado`;
- itens em comandas abertas reduzem somente o disponível projetado;
- baixa definitiva somente no fechamento da comanda;
- baixa de venda idempotente por `comanda + produto`;
- movimentos manuais: Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento manual que deixaria saldo negativo;
- bloqueio de novo lançamento quando o disponível projetado chega a zero;
- alertas quando há ação necessária;
- histórico de movimentos e CSV;
- operação offline e sincronização posterior.

A fórmula do saldo é `estoque inicial + soma dos movimentos imutáveis`.

#### Central gerencial do Estoque
A v0.22.0 acrescenta:
- indicadores de produtos controlados, críticos e abaixo do mínimo;
- físico, comprometido, disponível projetado e unidades em pedido;
- saúde do estoque;
- fluxo diário de entradas, vendas, perdas/consumo e ajustes;
- prioridades com mínimo, fornecedor e quantidade em pedido;
- últimas movimentações;
- atalhos para Configurar, Movimentar e Compras & Reposição.

No celular, produtos sem controle não exibem cartões numéricos vazios e os produtos controlados usam uma grade mais compacta para reduzir rolagem.

### Compras & Reposição — v0.22.0
Acesso em `Painel → Compras & Reposição`.

- fila automática de produtos com `Disponível projetado <= Estoque mínimo`;
- sugestão de compra editável;
- fornecedor opcional e fornecedor padrão por produto;
- criação rápida de pedidos agrupados por fornecedor;
- estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimento parcial e total;
- quantidade pendente por pedido/produto;
- bloqueio de recebimento acima do pendente;
- Entrada automática no Estoque Essencial;
- idempotência por `purchase_entry_<receiptId>_<productId>`;
- histórico de pedidos e recebimentos;
- copiar pedido como texto;
- exportação CSV;
- operação offline e sincronização posterior.

#### Central gerencial de Compras
Mostra:
- controlados, críticos, para repor, pedidos abertos, unidades em pedido e comprometidas;
- barra de saúde do estoque;
- físico, comprometido e disponível projetado;
- prioridades e quantidade já em pedido;
- rascunhos, enviados e recebimentos recentes;
- progresso de pedidos;
- cobertura e situação dos fornecedores.

A v0.22.0 **não calcula custo financeiro de compra/estoque**, porque o catálogo possui preço de venda e não um custo de aquisição confiável.

### Resumo do Turno, Auditoria e Fechamento
Na tela Histórico:
- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- itens vendidos;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- `Ver auditoria` com linha do tempo operacional;
- `Fechar turno` com conferência e bloqueios;
- snapshot imutável por data;
- consulta em `Fechamentos`;
- bloqueio de nova comanda após o encerramento do dia.

### Visão Gerencial
No `Painel`, a **Visão Gerencial** usa os fechamentos imutáveis como fonte de verdade e oferece:
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento acumulado, média por turno e ticket médio;
- comandas, itens e cancelamentos;
- comparação com período anterior equivalente;
- gráfico por turno fechado e melhor dia;
- consolidação de produtos e formas de pagamento;
- exportação CSV dos dados reais.

Dias sem fechamento não são inventados como faturamento zero.

### Modo demonstração
A Visão Gerencial possui um modo opcional de apresentação e treinamento:
- desligado por padrão;
- dados simulados somente em memória;
- não grava em `localStorage`;
- não sincroniza;
- não altera comandas, histórico, estoque, compras ou fechamentos reais;
- não interfere em WhatsApp;
- exportação CSV bloqueada durante a demonstração;
- recarregar o app restaura os dados reais.

### Clientes
- cadastro manual;
- captura automática quando a comanda contém nome + WhatsApp válido;
- importação TXT/CSV com prévia e validação;
- exportação CSV;
- autocomplete de nome/telefone;
- sincronização multidispositivo.

### WhatsApp
- envio opcional ao cliente mediante consentimento;
- templates UTILITY `atualizacao_comanda_rota27_mini2_1` a `_5`;
- envio incremental e agrupado;
- outbox local por aparelho com retry e idempotência;
- configuração sincronizada do WhatsApp do gerente;
- respostas dos clientes encaminhadas ao gerente pelo template `resposta_cliente_rota27_gerente_v1`;
- webhook inbound com correlação, idempotência e bloqueio de loop.

### Sincronização e offline
- gravação local-first;
- sincronização multidispositivo de comandas, histórico, cardápio, categorias, clientes, configuração do gerente, fechamentos, estoque e compras;
- `item_delta` para lançamentos concorrentes;
- eventos de estoque `stock_config_upsert` e `stock_movement`;
- eventos de compras `supplier_upsert`, `purchase_order_upsert` e `purchase_receipt`;
- outbox/cursor/log remoto idempotente;
- operação local continua disponível sem internet;
- filas de WhatsApp nunca são sincronizadas entre aparelhos.

## Estabilidade do Painel
A correção introduzida na v0.21.0 continua preservada. As novas visões gerenciais da v0.22.0 não adicionam polling visual nem novos `MutationObserver`; permanece somente a compatibilidade restrita ao `screenPanel`.

## Tema oficial da marca
- operação: laranja, preto e creme/marfim;
- verde/amarelo/vermelho reservados a estados funcionais;
- Ajuda **v4.6** preserva o Tema Capixaba e inclui Compras & Reposição, Estoque Essencial, Visão Gerencial, Modo demonstração, offline e sincronização.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 6 ACTIVE** (`rota27-sync-v0.22.0`), com os contratos anteriores e os eventos de Compras;
- `rota27-audit`: versão 1 ACTIVE, somente leitura;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

A v0.22.0 não exigiu migration nem tabela nova. O backend de sync foi ampliado somente na allowlist de eventos, reutilizando `rota27_sync_events`.

## Atualização da PWA
Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. manter internet ativa;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.22.0` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Segurança
- nenhum token/App Secret é versionado;
- credenciais reais não devem ser gravadas no GitHub;
- o fluxo continua local-first;
- outbox do WhatsApp permanece local por aparelho;
- nenhuma migration destrutiva foi necessária para a v0.22.0.

## Próxima versão
O escopo da próxima versão será definido a partir do uso real da v0.22.0. **A v0.23.0 ainda não possui escopo fechado.**

## Documentos principais
- `docs/RELEASE-v0.22.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.22.0.md`
- `docs/ESPEC-v0.22.0.md`
- `docs/REVISAO-GERENCIAL-v0.22.0.md`
- `docs/REVISAO-GERENCIAL-ESTOQUE-v0.22.0.md`
- `docs/HANDOFF-CONTEXTO-v0.22.0.md`
- `docs/PROMPT-NOVO-CHAT-v0.22.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão
Produção: **0.22.0**
