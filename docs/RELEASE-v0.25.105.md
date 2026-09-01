# Release v0.25.105 — produto e categoria canônicos

## Objetivo

Eliminar a transformação tardia e a interceptação global usadas desde a v0.25.80, preservando a interface aprovada dos editores de produto e categoria.

## Alterações

- removidos da origem o foco automático do nome do produto e o foco/seleção do nome da categoria;
- `menuItemEmoji` passa a nascer oculto no HTML, mantendo o valor padrão e a compatibilidade com dados históricos;
- excluído `assets/v02580-product-category-no-autofocus.js`;
- removidas as referências no HTML, roadmap e App Shell;
- atualizadas a identidade e a chave de cache para v0.25.105-r1.

## Critérios de homologação

- Novo/Editar produto abre sem foco ou teclado automático;
- Novo/Editar categoria abre sem foco ou seleção automática;
- os campos continuam recebendo foco manual;
- o campo Ícone não aparece e Categoria ocupa a largura disponível;
- cancelar e salvar continuam operacionais;
- não há exceções no navegador e o asset excluído deixa de ser publicado.

## Risco e rollback

A mudança não altera dados, Supabase, estoque, sincronização ou regras operacionais. O rollback funcional é a v0.25.104.
