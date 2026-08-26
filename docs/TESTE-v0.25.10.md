# Teste v0.25.10 — Resumo por Produto Atual

## Gate funcional
- abrir Histórico / Resumo do turno;
- localizar `Mais vendidos hoje`;
- confirmar que produtos são consolidados por ID;
- confirmar que `Cerveja IPA 500ml - Ronchi Beer` aparece com o nome atual do cadastro;
- confirmar que quantidade e receita não mudam por causa da renomeação;
- confirmar fallback para nome histórico se um produto não existir mais no catálogo.

## Regressão
- faturamento, ticket, itens vendidos e formas de pagamento permanecem inalterados;
- nenhuma comanda fechada é reescrita;
- nenhuma alteração de backend/sincronização.
