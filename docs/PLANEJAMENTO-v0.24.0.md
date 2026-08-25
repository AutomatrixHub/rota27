# Rota 27 — Planejamento v0.24.0

## Tema aprovado
**Custos & Margem**.

A v0.23.0 — Inventário & Conferência foi validada e promovida. A v0.24.0 está em desenvolvimento na branch `feature/v0.24.0-costs-margin`, PR #30 em draft.

## Objetivo
Adicionar visão econômica confiável aos produtos usando **custo real de aquisição**, sem confundir preço de venda com custo e sem transformar o Rota 27 em sistema fiscal/contábil.

## Decisões fechadas para a candidata
- custo de aquisição é opcional e sempre explícito;
- custo previsto pode ser informado na Reposição/pedido;
- custo real é confirmado no recebimento;
- custo pode variar por fornecedor;
- o último custo do mesmo produto/fornecedor é a primeira sugestão quando existir;
- na falta dele, pode ser sugerido o último custo real do produto;
- frete é opcional, separado e nunca inventado;
- quando houver frete + itens com custo conhecido, o rateio é proporcional ao subtotal de aquisição das linhas conhecidas;
- histórico de custo é derivado dos recebimentos reais e não reescreve o passado;
- margem exibida é **Margem bruta estimada**, baseada em preço de venda atual menos último custo efetivo real;
- valor estimado do estoque usa somente produtos com custo conhecido e mostra cobertura;
- produtos sem custo ficam fora das estimativas financeiras, nunca entram como custo zero;
- a v0.24 reutiliza `purchase_order_upsert` e `purchase_receipt`; os campos novos viajam nos payloads JSON existentes;
- nesta candidata não há novo tipo de evento, tabela ou migration de sync.

## Indicadores escolhidos
Os indicadores iniciais que podem mudar decisões reais são:
- cobertura de custo dos produtos controlados;
- valor estimado do estoque com cobertura conhecida;
- margem bruta estimada por produto;
- produtos com margem negativa;
- custo conhecido da reposição;
- evolução do custo entre recebimentos;
- produtos ainda sem custo registrado.

A média de margem, quando exibida, é uma **média simples dos produtos com base válida**, não média ponderada por vendas, estoque ou faturamento.

## Fora de escopo
- fiscal/NF-e/NFC-e;
- contabilidade;
- contas a pagar completas;
- DRE formal;
- impostos complexos;
- CMV contábil;
- custo médio contábil por lote;
- inventário valorizado por método fiscal;
- taxas de cartão;
- folha/pessoal;
- rateio avançado de custos indiretos;
- ERP.

## Regra de produto
**Não inferir custo a partir do preço de venda.** Indicadores financeiros só aparecem quando houver base de custo confiável.

## Implementação da candidata
A primeira candidata inclui:
- custo unitário previsto na Reposição;
- custo real e frete no recebimento;
- custo previsto/recebido nos cards de pedido;
- Central `Custos & Margem` com Visão geral, Produtos e Histórico de custos;
- histórico e CSV;
- integração visual com Compras & Reposição e Estoque Essencial;
- Ajuda v4.8;
- layout desktop/mobile;
- operação offline local;
- preparação para smoke A→B usando eventos existentes.

Ver:
- `docs/ESPEC-v0.24.0.md`;
- `docs/TESTE-v0.24.0.md`.

## Gates
1. teste local desktop/mobile;
2. cálculos e ausência de custo inventado;
3. regressões críticas;
4. smoke A→B de pedido e recebimento com custo;
5. comprovação dos campos nos payloads remotos;
6. documentação final;
7. autorização explícita para merge.

## Depois da v0.24
A próxima direção será decidida pelo uso real entre:
- inteligência de giro/reposição automática; ou
- relacionamento/fidelização de clientes.
