# v0.25.129 — remoção de encadeamento UX obsoleto

## Alteração

- remove `assets/v02546-attention-panel.js`;
- remove a chamada transitória em `v0256-release.js`;
- preserva o CSS do painel e o módulo UX v0.25.51 que implementa o painel atual.

## Motivo

O script v0.25.46 apenas tentava carregar a ponte v0.25.50, já removida. A UX v0.25.51 é carregada diretamente pela aplicação, portanto esse encadeamento não fornecia fallback e podia requisitar um arquivo inexistente.

## Homologação sugerida

1. Atualize o app para v0.25.129.
2. Abra **Painel** e confirme que “Hoje precisa de atenção” continua normal quando houver dados.
3. Abra **Cardápio**, adicione um item e confira o carrinho.
