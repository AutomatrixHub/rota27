# Rota 27 v0.25.55-r2 — republicação do shell/PWA

## Motivo

O código funcional da v0.25.55 havia sido mesclado e o GitHub Pages concluído com sucesso, porém o `index.html` ainda declarava `rota27-release-version=0.25.53` e carregava `roadmap-loader.js?v=02553r1`.

Em aparelhos com PWA/cache ativo isso permitia que a interface continuasse exibindo a versão anterior e não carregasse imediatamente o hotfix de foco da v0.25.55.

## Correção de publicação

- `index.html` passa a declarar `0.25.55`;
- `index.html` carrega diretamente `v02555-new-command-focus-root.js?v=02555r2`;
- `roadmap-loader.js` passa a ser solicitado como `?v=02555r2`;
- o asset do foco também usa cache-buster `02555r2`;
- Service Worker renovado para `rota27-comandas-v0.25.55-r2`.

## Escopo

Nenhuma regra de negócio foi alterada nesta republicação. A versão funcional permanece `0.25.55`.
