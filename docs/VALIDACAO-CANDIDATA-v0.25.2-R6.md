# Rota 27 v0.25.2 — Validação candidata R6

## Motivo
No reteste da R5, os ícones dos três cards principais apareciam por cerca de 1 segundo e depois desapareciam. Quando os módulos legados reescreviam o conteúdo interno dos cards, os elementos de ícone inseridos por JavaScript eram removidos, enquanto a grade CSS continuava reservando a coluna do ícone. Isso espremia o texto e quebrava o layout.

## Correção R6
- remove completamente os emojis/ícones inseridos por JavaScript;
- usa ícones lineares monocromáticos em SVG embutido via CSS `::before`;
- os ícones fazem parte da apresentação do próprio cabeçalho e sobrevivem aos `innerHTML` internos dos módulos legados;
- Visão Gerencial usa gráfico de barras;
- Estoque Essencial usa caixa/volume;
- Compras & Reposição usa carrinho;
- preserva a ponte R4 apenas para a posição de Relacionamento;
- não adiciona `setInterval` ou novo `MutationObserver`.

## Gate R6
1. Abrir Painel e confirmar os três ícones lineares.
2. Aguardar pelo menos 15 segundos.
3. Confirmar que ícones, textos e botões não somem nem mudam de coluna.
4. Sair do Painel e voltar.
5. Alterar algo que atualize Estoque/Compras e voltar ao Painel.
6. Validar desktop e celular sem texto espremido nem overflow horizontal.
7. Confirmar que os botões continuam com suas cores e funções originais.

## Cache
`rota27-comandas-v0.25.2-r6`

## Estado
**CANDIDATA — NÃO PUBLICAR antes do reteste e aprovação explícita.**
