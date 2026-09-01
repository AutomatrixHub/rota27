# Release v0.25.108 — primeira exclusão física controlada

## Objetivo

Concluir a segunda fase do ciclo iniciado na v0.25.107, excluindo somente os assets de código que permaneceram fora do App Shell durante a observação aprovada.

## Arquivos excluídos

- `assets/v021-compat.js`;
- `assets/v021-help-compat.js`;
- `assets/v02547-turn-favorites.css`;
- `assets/v02547-turn-favorites.js`;
- `assets/v02549-turn-favorites-hotfix.js`.

## Arquivo deliberadamente preservado

`assets/brand/rota27-logo-oficial.png` não foi excluído. Embora não integre o caminho de produção atual, ele ainda é referenciado por `assets/v0182-final.js`. Essa dependência transitiva será analisada e removida como lote separado para evitar uma URL quebrada em uma entrada histórica.

## Evidências

- os cinco arquivos já estavam fora do `APP_SHELL` desde a v0.25.107;
- nenhum deles é carregado por `index.html`;
- nenhum deles integra `assets/roadmap-loader.js`;
- a referência às classes `.v02547-turn-favorites` e `.v02549-quick-products` em `v02551-ux-hotfix.js` é apenas limpeza defensiva de DOM e não carrega os assets excluídos;
- todos os recursos restantes do App Shell continuam presentes.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.107 para a v0.25.108;
- abertura offline após instalação completa;
- ausência de falha na instalação do Service Worker;
- os cinco caminhos excluídos respondem 404 após o deploy;
- o logo preservado continua respondendo 200;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda permanecem funcionais;
- criar, editar, lançar e fechar comanda permanece funcional;
- nenhuma exceção nova aparece no navegador.

## Risco e rollback

A release não altera dados, Supabase, sincronização, estoque, WhatsApp ou regras operacionais. Em caso de regressão, o rollback deve restaurar os cinco arquivos em uma versão superior com novo `CACHE_NAME`; não se deve reutilizar a chave da v0.25.107.
