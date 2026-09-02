# Release v0.25.111 — descarte de marcadores de versão inativos

## Objetivo

Remover os marcadores e protetores de versão históricos que permaneciam no repositório, mas já não participavam de nenhum caminho de execução.

## Arquivos excluídos

- `assets/v014-rc1.js`;
- `assets/v015-final.js`;
- `assets/v016-final.js`;
- `assets/v0161-final.js`;
- `assets/v017-final.js`;
- `assets/v018-final.js`.

## Evidências

- os seis arquivos não aparecem em nenhum `script src` de HTML;
- não são carregados por `index.html`, `assets/roadmap-loader.js`, `sw.js` ou `v014-rc.html`;
- não integram o `APP_SHELL`;
- as únicas ocorrências restantes eram notas e registros de release em `docs/`;
- a identidade de versão atual é aplicada pelos módulos ativos v0.25.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.110 para a v0.25.111;
- abertura offline após instalação completa;
- ausência de falha na instalação do Service Worker;
- os seis caminhos excluídos respondem 404 após o deploy;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda permanecem funcionais;
- nenhuma exceção nova aparece no navegador.

## Risco e rollback

A release não altera comportamento, dados, Supabase, sincronização, estoque, WhatsApp ou regras operacionais. Em caso de regressão, o rollback deve restaurar os seis arquivos em uma versão superior com novo `CACHE_NAME`; não se deve reutilizar a chave da v0.25.110.
