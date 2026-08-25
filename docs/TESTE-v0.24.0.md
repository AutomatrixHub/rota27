# Rota 27 v0.24.0 — Plano de teste da candidata

## Estado
**CANDIDATA EM DESENVOLVIMENTO — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.23.0 — Inventário & Conferência**.

PR: **#30 — Rota 27 v0.24.0 — Custos & Margem**.

## Objetivo
Validar que custos de aquisição possam ser registrados de forma simples no fluxo de Compras, que os cálculos sejam transparentes e que o Rota 27 nunca invente custo quando a informação não existir.

---

## A — carregamento e regressão

### A1. Abrir candidata
Esperado:
- versão visível `v0.24.0`;
- Painel estável;
- Comandas, Estoque Essencial, Compras & Reposição e Inventário preservados;
- nenhuma cintilação/travamento;
- Ajuda identificada como v4.8.

### A2. Acessos
Esperado:
- em Compras & Reposição existe acesso a `Custos & Margem`;
- em Estoque Essencial existe acesso a `Custos & Margem`;
- a Central abre sem criar novo card obrigatório no Painel.

---

## B — regra de segurança: sem custo inventado

### B1. Produto sem histórico de custo
Esperado:
- aparece como `Sem custo registrado`;
- margem fica indisponível;
- valor estimado de estoque daquele produto fica indisponível;
- nenhum cálculo usa preço de venda como substituto do custo.

### B2. Cobertura
Esperado:
- indicadores separam produtos com custo conhecido e sem custo;
- valor estimado do estoque soma somente produtos com custo conhecido;
- produto sem custo não entra como custo zero.

---

## C — custo previsto na Reposição

### C1. Produto abaixo do mínimo
Na aba `Reposição`, esperado:
- campo `Custo unit. previsto` disponível;
- campo é opcional;
- subtotal previsto acompanha quantidade × custo;
- se houver último custo confiável, pode aparecer como sugestão editável.

### C2. Criar pedido com custo previsto
Exemplo:
- quantidade: 6;
- custo unitário previsto: R$ 2,00.

Esperado:
- pedido é criado normalmente;
- custo previsto conhecido = R$ 12,00;
- fluxo continua funcionando mesmo se outro item do mesmo pedido estiver sem custo.

### C3. Criar pedido sem custo
Esperado:
- pedido continua sendo criado;
- sistema mostra `Sem custo`/indisponível em vez de calcular valor artificial.

---

## D — custo real no recebimento

### D1. Receber pedido com custo previsto
Esperado:
- custo previsto aparece como sugestão no campo `Custo unitário`;
- usuário pode alterá-lo para o custo efetivamente pago.

### D2. Exemplo sem frete
Pedido/recebimento:
- quantidade recebida: 6;
- custo real unitário: R$ 2,20;
- frete: vazio.

Esperado:
- subtotal conhecido = R$ 13,20;
- custo efetivo unitário = R$ 2,20;
- recebimento continua gerando Entrada no Estoque Essencial uma única vez.

### D3. Exemplo com frete — um item
- quantidade: 6;
- custo unitário: R$ 2,20;
- frete: R$ 1,20.

Esperado:
- custo dos itens = R$ 13,20;
- total aquisição = R$ 14,40;
- todo o frete é atribuído à única linha conhecida;
- custo efetivo unitário = R$ 2,40.

### D4. Frete sem nenhum custo conhecido
Esperado:
- frete é preservado no recebimento;
- sistema NÃO transforma o frete em custo unitário inventado;
- margem/valor de estoque continuam indisponíveis para itens sem custo real.

### D5. Recebimento parcial
Esperado:
- custo é registrado apenas sobre a quantidade que chegou agora;
- pedido continua parcial/enviado quando ainda houver quantidade pendente;
- recebimento posterior gera um novo registro de custo histórico.

---

## E — histórico de custos

### E1. Primeiro recebimento com custo
Esperado:
- produto aparece em `Histórico de custos`;
- mostra fornecedor, pedido, data, quantidade, custo unitário, frete rateado e custo efetivo.

### E2. Segundo recebimento com custo diferente
Esperado:
- o registro antigo permanece intacto;
- o último custo passa a ser o mais recente;
- a visão geral pode mostrar a variação entre os dois custos.

### E3. Fornecedores diferentes
Esperado:
- histórico preserva o fornecedor de cada recebimento;
- uma nova reposição pode sugerir primeiro o último custo daquele mesmo fornecedor e, na falta dele, o último custo conhecido do produto.

### E4. CSV
Esperado:
- exportação contém data, pedido, fornecedor, produto, quantidade, custo unitário, frete rateado, custo efetivo unitário e subtotal efetivo.

---

## F — margem bruta estimada

### F1. Produto com preço e custo conhecidos
Exemplo:
- preço de venda atual: R$ 6,00;
- custo efetivo: R$ 2,40.

Esperado:
- margem unitária = R$ 3,60;
- margem bruta estimada = 60,0%.

### F2. Produto sem custo
Esperado:
- margem indisponível.

### F3. Produto sem preço válido
Esperado:
- margem indisponível mesmo que exista custo.

### F4. Margem negativa
Exemplo:
- venda R$ 6,00;
- custo efetivo R$ 6,50.

Esperado:
- margem unitária = -R$ 0,50;
- margem percentual negativa;
- alerta visual funcional.

Importante: a v0.24 não inclui impostos, taxas de cartão, perdas, mão de obra ou custos indiretos. O indicador deve ser chamado de **Margem bruta estimada**, nunca lucro líquido.

---

## G — valor estimado do estoque

### G1. Produto com custo conhecido
Exemplo:
- estoque físico = 10;
- último custo efetivo = R$ 2,40.

Esperado:
- valor estimado = R$ 24,00.

### G2. Produtos mistos
Com um produto com custo e outro sem custo, esperado:
- total financeiro soma somente a cobertura conhecida;
- cobertura informa quantos controlados têm custo;
- produto desconhecido não entra como zero.

---

## H — mobile

Validar em aparelho real:
- sem rolagem horizontal;
- campos de custo e frete confortáveis com teclado numérico;
- Reposição continua rápida;
- recebimento não fica excessivamente alto/largo;
- Central Custos & Margem usa leitura vertical no celular;
- KPIs em duas colunas;
- cards de produto e histórico permanecem legíveis;
- botões continuam confortáveis para toque.

---

## I — offline local

### I1. Criar pedido offline
Esperado:
- custo previsto permanece salvo localmente;
- operação não é bloqueada.

### I2. Receber offline
Esperado:
- custo real e frete permanecem no recebimento local;
- Entrada de estoque continua idempotente;
- sincronização ocorre posteriormente quando a conexão voltar.

---

## J — multidispositivo

Executar somente depois do gate local.

A v0.24 reutiliza:
- `purchase_order_upsert`;
- `purchase_receipt`.

### J1. Pedido A → B
No aparelho A, criar pedido com custo previsto.

Esperado no B:
- mesmo pedido;
- `unitCostQuoted` preservado;
- custo previsto igual.

### J2. Recebimento A → B
No A, receber com custo real e frete.

Esperado no B:
- mesmo recebimento;
- custo unitário, frete, custo efetivo e histórico iguais;
- estoque converge normalmente.

### J3. Idempotência
Repetir sincronização/reconexão.

Esperado:
- nenhum recebimento duplicado;
- nenhuma Entrada de estoque duplicada;
- histórico financeiro não duplica o mesmo recebimento.

---

## K — regressão crítica

Validar:
- abrir/editar/fechar/cancelar comandas;
- pagamentos e totais;
- baixa de venda;
- Entrada/Perda/Consumo/Ajuste manual;
- fila e pedidos de Compras & Reposição;
- recebimento parcial/total;
- Inventário & Conferência;
- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração;
- WhatsApp/inbound;
- atualização PWA sem limpar dados.

## Gate local
Somente avançar para A→B depois de:
- custo previsto aprovado;
- custo real/frete aprovados;
- histórico aprovado;
- margem/valor de estoque aprovados;
- desktop e mobile aprovados;
- nenhuma regressão P0/P1.

## Gate de produção
Somente promover após:
- gate local aprovado;
- A→B aprovado;
- campos de custo confirmados no log remoto dentro dos payloads de compra;
- documentação final atualizada;
- autorização explícita para merge.
