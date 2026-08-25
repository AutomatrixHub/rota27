# Rota 27 v0.24.0 — Testes e validação final

## Estado
**APROVADO PARA PRODUÇÃO em 25/08/2026.**

PR: **#30 — Rota 27 v0.24.0 — Custos & Margem**.

Baseline de rollback: **v0.23.0 — Inventário & Conferência**.

## Resultado final
Os gates local, mobile, multidispositivo e de backend foram aprovados.

### Gate local
Aprovado:
- versão visível `v0.24.0`;
- Painel estável;
- Custos & Margem acessível por Compras e Estoque;
- custo previsto opcional na Reposição;
- custo real e frete no recebimento;
- histórico de custos;
- margem bruta estimada;
- valor estimado de estoque;
- produto sem custo sem números artificiais;
- edição de pedido em rascunho;
- badge de versão estabilizado.

### Gate mobile
Aprovado em aparelho real:
- sem problema relevante de largura/rolagem horizontal observado;
- campos de custo e frete utilizáveis;
- Central Custos & Margem legível em leitura vertical;
- cards de produtos e histórico legíveis;
- editor de rascunho responsivo.

### Gate A→B
Aprovado:
- pedido com custo previsto converge entre aparelhos;
- recebimento com custo real e frete converge;
- histórico e margem aparecem iguais nos aparelhos;
- edição de rascunho converge via `purchase_order_upsert`.

### Prova no log remoto
Confirmado no Supabase:
- `unitCostQuoted`;
- `unitCost`;
- `lineCost`;
- `freightCost`;
- `freightShare`;
- `effectiveLineCost`;
- `effectiveUnitCost`;
- `totalAcquisitionCost`;
- `costAppVersion = 0.24.0`;
- `editedAppVersion = 0.24.0` em edição de rascunho.

Exemplo validado no pedido `PC-260825-2VO6`:
- quantidade: 5;
- custo unitário: R$ 2,50;
- itens: R$ 12,50;
- frete: R$ 2,50;
- total aquisição: R$ 15,00;
- custo efetivo unitário: R$ 3,00.

A Central exibiu corretamente, para a Geleia de Pimenta com venda a R$ 22,00:
- último custo: R$ 3,00;
- margem unitária: R$ 19,00;
- margem bruta estimada: 86,4%.

## Regra de segurança validada
Produto sem custo real:
- aparece como `sem custo`/`Sem custo registrado`;
- último custo = indisponível;
- margem = indisponível;
- valor de estoque = indisponível;
- preço de venda não é usado como substituto do custo.

## Custo previsto e recebimento
Aprovado:
- custo unitário previsto é opcional;
- subtotal acompanha quantidade × custo;
- histórico anterior pode sugerir custo, mantendo edição livre;
- custo real pode substituir a previsão no recebimento;
- frete é opcional;
- frete é rateado apenas entre linhas com custo conhecido;
- se não há custo conhecido, o frete não cria custo unitário artificial.

## Editor de rascunho
Aprovado:
- botão `Editar` somente em `draft`;
- alterar quantidade;
- alterar custo previsto;
- trocar fornecedor;
- adicionar/remover produtos;
- editar observação;
- recalcular total previsto conhecido;
- salvar e sincronizar a alteração.

## Fórmulas validadas
- margem unitária = preço de venda atual − último custo efetivo real;
- margem bruta estimada % = margem unitária / preço de venda × 100;
- valor estimado do estoque = estoque físico atual × último custo efetivo real.

Esses números são gerenciais, não contábeis.

## Sincronização
A v0.24 reutiliza:
- `purchase_order_upsert`;
- `purchase_receipt`.

Não foi necessário criar:
- novo tipo de evento;
- nova tabela;
- nova migration;
- nova versão da Edge Function.

O backend v0.23/Edge v7 transportou corretamente os payloads da v0.24.

## Regressão crítica
Durante o ciclo de validação não foi observada regressão P0/P1 nos fluxos exercitados de:
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- sincronização;
- navegação desktop/mobile.

## Autorização de produção
Após o teste da edição de rascunho, o usuário registrou aprovação explícita para prosseguir com a promoção da v0.24.0.
