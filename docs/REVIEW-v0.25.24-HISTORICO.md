# Revisão visual — Histórico & resultados v0.25.24

A revisão partiu da tela mobile validada em produção e comparou sua hierarquia com o acabamento aprovado em **Fechamentos v0.25.23**.

## Diagnóstico
- a tela já estava funcional e coerente;
- havia mais altura e peso visual do que o necessário na toolbar, busca, métricas e rankings;
- os valores dos indicadores podiam assumir maior prioridade visual;
- o rótulo **Comandas** podia ser alinhado à linguagem operacional de **Comandas fechadas**;
- os painéis de ranking e a lista final podiam ganhar densidade sem perder legibilidade ou área de toque.

## Decisões
- nenhuma mudança de fluxo ou cálculo;
- somente CSS adicional, carregado após os estilos históricos existentes;
- preservação integral de Ontem, busca, rankings, CSV, backup/restauração e detalhes de comandas;
- sem MutationObserver ou polling.
