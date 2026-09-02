# Release v0.25.112 — descarte do replay histórico hibernado

## Objetivo

Remover fisicamente o executor excepcional de replay de mensagens históricas, que permaneceu hibernado desde a v0.25.8 e não integra a produção atual.

## Arquivos excluídos

- `assets/v0257-history-replay.js`;
- `assets/v0257-history-replay.css`.

## Contexto

O código continha uma lista fixa de 23 mensagens históricas, um destino WhatsApp fixo e uma interface administrativa capaz de iniciar o reenvio sob confirmação manual. Desde a v0.25.8, os arquivos já estavam fora do carregamento e do App Shell.

## Evidências

- não há `script src`, `link href`, carregamento dinâmico ou entrada no `APP_SHELL` para a dupla;
- a única referência ativa relacionada é a função `removeReplayUi()` em `v0256-release.js`, que apenas remove vestígios de uma interface trazida por cache antigo;
- o estado local `rota27_v0257_replay_20260825_v1` não é apagado;
- os registros descritivos das releases v0.25.7 e v0.25.8 permanecem em `docs/`.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.111 para a v0.25.112;
- abertura offline após instalação completa;
- ausência de falha na instalação do Service Worker;
- os dois caminhos excluídos respondem 404 após o deploy;
- WhatsApp do gerente e da comanda continuam disponíveis;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda permanecem funcionais;
- nenhuma exceção nova aparece no navegador.

## Risco e rollback

A release não altera o envio normal de WhatsApp, dados, Supabase, sincronização, estoque ou regras operacionais. Em caso de regressão, o rollback deve restaurar os dois arquivos em uma versão superior com novo `CACHE_NAME`; não se deve reutilizar a chave da v0.25.111.
