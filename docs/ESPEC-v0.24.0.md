# Rota 27 v0.24.0 — Especificação funcional

## Tema
**Custos & Margem**

## Objetivo
Adicionar visão econômica confiável aos produtos usando somente custo real de aquisição informado pelo usuário e/ou registrado em recebimentos de compra. O Rota 27 não deve inferir custo a partir do preço de venda e não deve virar ERP, sistema fiscal ou contábil.

## Princípios
1. **Custo explícito, nunca inventado.** Sem custo confiável, o indicador financeiro aparece como indisponível.
2. **Recebimento é a principal fonte de verdade do custo.** O pedido pode carregar um custo previsto, mas o recebimento registra o custo efetivamente informado para o que chegou.
3. **Histórico imutável por recebimento.** O custo histórico é derivado dos recebimentos; não se reescreve o passado ao alterar um custo futuro.
4. **Transparência de fórmula.** Margem, valor de estoque e custo de reposição devem indicar qual base de custo foi utilizada.
5. **Operação primeiro.** Não adicionar fiscal, contas a pagar, DRE, impostos, rateios complexos ou fluxo contábil.

## Escopo funcional

### 1. Custo no pedido
Na criação de um pedido, cada item pode ter um **Custo unitário previsto** opcional.

- o campo pode ficar vazio;
- quando houver histórico confiável para aquele produto/fornecedor, o app pode sugerir o último custo registrado;
- o usuário pode alterar a sugestão;
- o pedido mostra o custo previsto apenas para itens com custo informado;
- itens sem custo não recebem estimativa inventada.

Campos novos por item do pedido:
- `unitCostQuoted` — custo unitário previsto, opcional;
- `costSource` — `manual`, `last_supplier_cost` ou `last_product_cost`, quando aplicável.

### 2. Custo no recebimento
Ao receber um pedido, cada item recebido mostra:
- quantidade recebida;
- custo unitário;
- subtotal da linha.

O custo unitário é opcional, mas quando houver custo previsto no pedido ele é carregado como sugestão. Se não houver, o app pode sugerir o último custo real do mesmo produto/fornecedor.

O recebimento também possui um campo opcional:
- **Frete desta entrega**.

O frete não é obrigatório. Quando informado, ele entra no custo total do recebimento e pode ser distribuído proporcionalmente entre os itens que possuem custo conhecido.

Campos novos no recebimento:
- por item: `unitCost` e `lineCost`;
- no recebimento: `freightCost`, `itemsCost`, `totalAcquisitionCost`;
- metadados de custo calculados de forma determinística.

### 3. Custo efetivo com frete
Quando `freightCost > 0`, o frete é rateado **proporcionalmente ao subtotal de aquisição de cada item com custo conhecido**.

Para uma linha:
- `baseLineCost = quantidade × custo unitário`;
- `freightShare = frete × (baseLineCost / soma dos baseLineCost conhecidos)`;
- `effectiveLineCost = baseLineCost + freightShare`;
- `effectiveUnitCost = effectiveLineCost / quantidade`.

Se nenhuma linha possuir custo conhecido, o frete é preservado no recebimento, mas não é distribuído nem usado para inventar custo unitário.

### 4. Histórico de custos
O histórico é derivado dos recebimentos reais que possuem custo informado.

Para cada produto, mostrar:
- último custo unitário real;
- último custo unitário efetivo, quando houver frete rateado;
- fornecedor;
- data/hora;
- pedido/recebimento de origem;
- quantidade recebida;
- evolução dos últimos registros.

Também deve ser possível filtrar por fornecedor.

### 5. Margem bruta estimada
A margem usa o **preço de venda atual do catálogo** e o **último custo real confiável** do produto.

Fórmulas:
- `margem unitária = preço de venda - custo efetivo unitário`;
- `margem % = margem unitária / preço de venda × 100`.

Regras:
- se não houver preço de venda válido, não calcular margem;
- se não houver custo real, mostrar `Sem custo registrado`;
- margem negativa deve aparecer como alerta funcional;
- não incluir impostos, taxas de cartão, perdas ou custos indiretos nesta versão.

O rótulo deve ser **Margem bruta estimada**, nunca lucro líquido.

### 6. Valor estimado do estoque
Para produtos com controle ativo e custo conhecido:
- `valor estimado = estoque físico atual × último custo efetivo unitário`.

Exibir separadamente:
- quantidade de produtos controlados com custo conhecido;
- quantidade sem custo conhecido;
- valor estimado somente sobre a cobertura conhecida;
- percentual de cobertura de custo.

Nunca assumir custo zero para produto sem custo.

### 7. Custo de reposição e pedidos
Na fila de Reposição:
- mostrar último custo quando disponível;
- permitir custo previsto por item;
- mostrar subtotal previsto do item.

Em Pedidos:
- mostrar custo previsto conhecido;
- mostrar custo recebido conhecido;
- mostrar pendência em quantidade e, quando possível, pendência estimada em R$.

A estimativa deve usar, nesta ordem:
1. custo previsto explícito daquele pedido;
2. último custo do mesmo produto/fornecedor;
3. último custo do produto;
4. indisponível.

### 8. Central Custos & Margem
A v0.24 terá uma visão gerencial própria, acessível a partir de Compras & Reposição e Estoque Essencial, sem novo card obrigatório no Painel.

Indicadores principais:
- produtos com custo conhecido;
- cobertura de custo do estoque controlado;
- valor estimado do estoque conhecido;
- margem média simples dos produtos com base válida;
- produtos com margem baixa/negativa;
- custo de reposição conhecido dos itens em atenção.

Listas gerenciais:
- produtos sem custo registrado;
- menores margens;
- maiores custos de reposição;
- custos que subiram/caíram no último recebimento;
- últimos recebimentos com custo.

### 9. Offline e multidispositivo
A v0.24 **reutiliza os eventos já existentes** de Compras:
- `purchase_order_upsert`;
- `purchase_receipt`.

Os campos de custo viajam dentro dos objetos de pedido/recebimento. Portanto, nesta primeira versão:
- não é necessário novo tipo de evento;
- não é necessária nova tabela;
- não é necessária nova migration de sync;
- o backend v0.23 já pode transportar os novos campos por ser payload JSON.

O gate multidispositivo deve confirmar que custos previstos e custos reais convergem A→B.

## Dados locais
Não é necessário duplicar histórico em um novo banco local: o histórico de custo pode ser derivado de `rota27_v022_purchase_receipts_v1` e dos pedidos existentes.

Pode existir apenas uma chave de preferências/metadados da v0.24, se necessário para filtros/estado de UI:
- `rota27_v024_cost_meta_v1`.

## Integração visual
### Compras & Reposição
- custo previsto na Reposição;
- custo previsto e recebido em Pedidos;
- custo unitário + frete no recebimento;
- atalho para abrir Custos & Margem.

### Estoque Essencial
- mostrar custo conhecido e valor estimado apenas quando houver base;
- atalho para a Central Custos & Margem;
- sem aumentar a altura de cada produto no mobile de forma excessiva.

### Visão Gerencial
Nesta versão, não alterar a fonte de verdade de faturamento. Custos & Margem será uma camada separada e explicitamente estimada.

## Fora de escopo
- NF-e/NFC-e;
- impostos;
- contas a pagar;
- conciliação bancária;
- DRE formal;
- CMV contábil;
- custo médio contábil por lote;
- inventário valorizado por método fiscal;
- rateio avançado de despesas indiretas;
- taxas de cartão;
- folha/pessoal;
- ERP.

## Critérios de aceite
1. Custo nunca aparece se não houver base explícita.
2. Pedido aceita custo previsto opcional sem bloquear a compra.
3. Recebimento aceita custo real por item e frete opcional.
4. Histórico preserva custo por recebimento.
5. Margem é calculada somente com preço + custo válidos.
6. Estoque valorizado mostra cobertura conhecida e não trata desconhecido como zero.
7. Layout funciona em celular sem rolagem horizontal.
8. Fluxos existentes de Compras, Estoque e Inventário continuam funcionando sem regressão.
9. Custos sincronizam entre aparelhos pelos eventos de compra já existentes.
10. Nenhuma função fiscal/contábil é introduzida.
