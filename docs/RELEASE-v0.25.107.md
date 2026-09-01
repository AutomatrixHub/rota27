# Release v0.25.107 — observação do App Shell

## Objetivo

Retomar a limpeza controlada do legado sem apagar arquivos antes de observar seu comportamento fora do pré-cache do Service Worker.

## Alterações

Foram removidos somente do `APP_SHELL`:

- `assets/brand/rota27-logo-oficial.png`;
- `assets/v021-compat.js`;
- `assets/v021-help-compat.js`;
- `assets/v02547-turn-favorites.css`;
- `assets/v02547-turn-favorites.js`;
- `assets/v02549-turn-favorites-hotfix.js`.

Todos os seis arquivos continuam presentes no repositório e acessíveis por URL direta. Nenhum asset foi excluído nesta release.

## Evidência de desreferenciação

- nenhum dos seis assets é carregado por `index.html`;
- nenhum dos seis assets integra `assets/roadmap-loader.js`;
- as únicas referências de produção removidas estavam no `APP_SHELL`;
- o arquivo de logo ainda é mencionado por `v0182-final.js`, que não integra o caminho de carregamento atual, motivo pelo qual o arquivo físico foi preservado.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.106 para a v0.25.107;
- abertura offline após uma abertura online completa;
- ausência de falha na instalação do Service Worker;
- ausência de 404 e exceções no carregamento normal;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda funcionais;
- criar, editar, lançar e fechar comanda;
- Modo Teste entra, opera e sai sem contaminar dados reais;
- os seis arquivos continuam respondendo por URL direta durante o período de observação.

## Risco e rollback

A mudança não altera dados, Supabase, sincronização ou regras operacionais. Em caso de regressão, os seis caminhos podem voltar ao `APP_SHELL` em uma versão superior com novo nome de cache. O rollback funcional de referência é a v0.25.106.

## Próxima etapa bloqueada

A exclusão física destes arquivos somente poderá ocorrer após ciclos operacionais completos sem regressão, nova busca global de referências e verificação de ausência de uso externo.
