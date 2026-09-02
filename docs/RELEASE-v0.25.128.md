# v0.25.128 — remoção de ponte UX legada

## Alteração

- remove `assets/v02550-ui-stability.js`;
- remove o arquivo do App Shell;
- preserva `assets/v02551-ux-hotfix.js` e seus carregamentos diretos.

## Motivo

A v0.25.50 era uma ponte de compatibilidade de 10 linhas. Ela apenas tentava adicionar o mesmo script v0.25.51 que já é incluído diretamente pelo bootstrap e pelo roadmap atual.

## Garantias

- a UX v0.25.51 continua responsável por atalhos de produtos, carrinho e painel de atenção;
- não há alteração em operação, dados, sincronização ou Modo Teste.

## Homologação sugerida

1. Atualize o app para v0.25.128.
2. Abra **Cardápio**, inclua um item em uma comanda e confira o carrinho.
3. Abra **Painel** e confirme que a tela carrega normalmente.
