# Rota 27 v0.22.0 — Plano de teste da candidata

## Estado
**CANDIDATA EM DESENVOLVIMENTO — NÃO PUBLICADA EM PRODUÇÃO.**

Baseline de produção preservada: **v0.21.0 — Estoque Essencial**.

PR de desenvolvimento: **#27 — Rota 27 v0.22.0 — Compras & Reposição**.

## Objetivo da validação
Confirmar que Compras & Reposição reduz o caminho entre alerta de estoque e recebimento, sem criar regressão em Comandas, Estoque Essencial, Fechamento do Turno, Visão Gerencial, Modo demonstração ou WhatsApp.

A candidata não deve exigir limpeza de `localStorage`, reinstalação da PWA ou alteração manual de dados.

---

## Bloco A — carregamento e estabilidade

### A1. Abrir a candidata
Esperado:
- interface abre normalmente;
- versão visível `v0.22.0`;
- Painel contém `Visão Gerencial`, `Estoque Essencial` e `Compras & Reposição`;
- nenhuma tela fica travada;
- nenhum card pisca/desaparece periodicamente.

### A2. Permanecer no Painel por pelo menos 30 segundos
Esperado:
- nenhum polling visual perceptível;
- `Visão Gerencial`, `Estoque Essencial` e `Compras & Reposição` permanecem estáveis;
- botões continuam respondendo.

### A3. Navegar entre telas e voltar ao Painel
Esperado:
- os três cards continuam presentes;
- não há duplicação de cards;
- não há congelamento da interface.

---

## Bloco B — fila de reposição

Pré-condição: existir pelo menos um produto com controle de estoque ativo.

### B1. Produto acima do mínimo
Esperado:
- não aparece na fila `Reposição`.

### B2. Produto igual ou abaixo do mínimo
Esperado:
- aparece automaticamente em `Compras & Reposição → Reposição`;
- mostra estoque disponível projetado e mínimo;
- vem selecionado para compra;
- quantidade sugerida é maior que zero.

### B3. Quantidade sugerida
Regra da candidata:

`max(0, estoque mínimo + 1 - disponível projetado)`

Esperado:
- sugestão é transparente;
- operador consegue alterar antes de criar o pedido;
- quantidade zero não cria item de pedido.

### B4. Comanda aberta compromete estoque
Adicionar produto controlado a uma comanda sem fechá-la.

Esperado:
- `Disponível projetado` diminui;
- fila de reposição reage ao novo disponível;
- saldo definitivo do estoque ainda não baixa;
- ao editar/cancelar a comanda, a projeção volta a refletir a quantidade correta.

---

## Bloco C — fornecedores

### C1. Criar fornecedor
Cadastrar:
- nome;
- telefone/WhatsApp opcional;
- observação opcional;
- um ou mais produtos controlados.

Esperado:
- fornecedor aparece na aba `Fornecedores`;
- produto associado passa a sugerir esse fornecedor na reposição.

### C2. Editar fornecedor
Esperado:
- alterações persistem;
- associação de produtos é atualizada;
- um produto fica com apenas um fornecedor padrão nesta etapa.

### C3. Arquivar fornecedor
Esperado:
- fornecedor deixa a lista ativa;
- pedidos históricos continuam preservando o nome do fornecedor;
- nenhum pedido ou movimento de estoque é apagado.

### C4. Produto sem fornecedor
Esperado:
- continua podendo gerar pedido normalmente como `Sem fornecedor`.

---

## Bloco D — criação e ciclo do pedido

### D1. Criar pedido de um produto
Na fila de reposição, manter um item selecionado e criar pedido.

Esperado:
- pedido nasce em `Rascunho`;
- contém snapshot de produto, quantidade e fornecedor;
- aparece na aba `Pedidos`;
- fila não é apagada artificialmente: ela continua derivada do estoque real.

### D2. Agrupamento por fornecedor
Selecionar produtos de fornecedores diferentes.

Esperado:
- candidata cria pedidos separados por fornecedor;
- itens sem fornecedor ficam em grupo próprio.

### D3. Marcar enviado
Esperado:
- `Rascunho → Enviado`;
- quantidades não mudam;
- estoque não muda.

### D4. Copiar pedido
Esperado:
- texto simples contém código do pedido, fornecedor quando houver, produtos e quantidades;
- nenhuma mensagem é enviada automaticamente;
- WhatsApp do cliente/gerente não é acionado.

### D5. Cancelar pedido
Esperado:
- pedido passa para `Cancelado`;
- permanece no histórico;
- não aceita recebimento;
- estoque não muda.

---

## Bloco E — recebimento e idempotência

### E1. Recebimento parcial
Criar pedido de quantidade maior que 1 e receber apenas parte.

Esperado:
- recebimento é registrado;
- pedido permanece pendente em estado `Enviado`;
- quantidade pendente diminui corretamente;
- Estoque Essencial recebe uma `Entrada` exatamente com a quantidade recebida.

### E2. Segundo recebimento
Receber o restante.

Esperado:
- pedido passa automaticamente para `Recebido`;
- pendência chega a zero;
- estoque soma apenas as duas quantidades realmente recebidas.

### E3. Bloqueio de excesso
Tentar informar quantidade maior que a pendente.

Esperado:
- operação é bloqueada;
- nenhum recebimento é salvo;
- nenhum movimento de estoque é criado.

### E4. Idempotência da Entrada
Cada recebimento usa movimento determinístico:

`purchase_entry_<receiptId>_<productId>`

Esperado:
- reaplicar o mesmo recebimento não duplica saldo;
- histórico do estoque mostra apenas uma Entrada para aquele receipt/produto.

### E5. Histórico do estoque
Esperado:
- botão `Histórico` continua disponível no Estoque Essencial;
- recebimentos aparecem como `Entrada` com referência ao pedido;
- vendas, perdas, consumo e ajustes anteriores permanecem intactos.

---

## Bloco F — offline local

### F1. Criar fornecedor offline
Esperado:
- salva localmente;
- interface continua funcional.

### F2. Criar pedido offline
Esperado:
- salva localmente;
- pedido pode ser consultado e editado pelo fluxo previsto.

### F3. Registrar recebimento offline
Esperado:
- receipt salva localmente;
- Entrada é aplicada ao Estoque Essencial uma única vez;
- nenhuma falha de rede bloqueia o atendimento normal.

### F4. Voltar online com backend ainda v0.21
Esperado nesta fase da candidata:
- estoque continua sincronizando pelos eventos v0.21 já suportados;
- eventos de Compras permanecem na fila local;
- módulo mostra aviso neutro de que a sincronização multidispositivo de Compras ainda não foi ativada;
- não perde fornecedor, pedido ou recebimento.

---

## Bloco G — sincronização multidispositivo

**Executar somente após implantação da allowlist v0.22 no `rota27-sync`.**

Novos eventos previstos:
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Não haverá migration nem tabela nova.

### G1. Fornecedor
Criar/editar no aparelho A.

Esperado:
- converge no aparelho B;
- associação de produto converge.

### G2. Pedido
Criar no A.

Esperado:
- aparece no B uma única vez;
- estado e quantidades coincidem.

### G3. Recebimento
Receber no A.

Esperado:
- receipt aparece no B uma única vez;
- Entrada do estoque converge uma única vez;
- nenhuma duplicidade mesmo que `purchase_receipt` e `stock_movement` cheguem em ordens diferentes.

### G4. Offline → online
Criar pedido/recebimento offline e reconectar.

Esperado:
- outbox converge;
- IDs preservam idempotência;
- saldo final igual nos dois aparelhos.

---

## Bloco H — regressão crítica

Validar sem exceção:

### Comandas
- abrir por Balcão, mesa, parklet e cliente;
- lançar item;
- editar item;
- fechar e pagar;
- cancelar com segurança;
- prevenção de duplicidade.

### Estoque Essencial
- ativação/configuração existente preservada;
- comprometido/disponível projetado corretos;
- baixa de venda somente no fechamento;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de negativo;
- bloqueio de item sem disponível projetado;
- CSV e Histórico.

### Fechamento do Turno
- conferência;
- bloqueios;
- snapshot imutável;
- consulta de fechamentos;
- bloqueio de nova comanda após encerramento.

### Visão Gerencial
- 7/30/90 dias e histórico completo;
- métricas e gráfico;
- produtos e pagamentos;
- CSV dos dados reais.

### Modo demonstração
- começa desligado;
- dados somente em memória;
- não salva nem sincroniza;
- exportação bloqueada durante demonstração;
- retorno aos dados reais funciona.

### WhatsApp
- cliente/gerente preservados;
- inbound preservado;
- nenhuma ação de Compras dispara WhatsApp automaticamente;
- outbox continua local por aparelho.

---

## Gate para backend v0.22
Antes de ampliar `rota27-sync`, aprovar pelo menos:
- A1–A3;
- B1–B4;
- C1–C4;
- D1–D5;
- E1–E5;
- F1–F4;
- regressão visual e funcional do Painel.

Somente então ampliar a allowlist do backend e executar o Bloco G.

## Gate para produção
A v0.22.0 só poderá ser marcada ready/mesclada após:
- testes locais aprovados;
- sincronização multidispositivo aprovada;
- regressões críticas aprovadas;
- nenhuma cintilação/travamento do Painel;
- autorização explícita para promoção.

Até lá, **`main` e produção permanecem v0.21.0**.
