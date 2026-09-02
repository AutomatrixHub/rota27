# Release v0.25.109 — encerramento da cadeia visual histórica

## Objetivo

Concluir o tratamento separado da cadeia `v0182-final.js` → logo oficial, removendo os dois arquivos históricos após confirmar que não participam da produção atual.

## Arquivos excluídos

- `assets/v0182-final.js`;
- `assets/brand/rota27-logo-oficial.png`.

## Evidências

- `v0182-final.js` não é carregado por `index.html`;
- o script não integra `assets/roadmap-loader.js` nem o `APP_SHELL` do Service Worker;
- a única referência funcional ao PNG estava dentro do próprio script excluído;
- a produção atual usa a logo embutida como `data:image/png` em `base-v013.html`;
- nenhum carregamento dinâmico por nome aponta para os dois arquivos;
- todos os recursos restantes do App Shell continuam presentes.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.108 para a v0.25.109;
- abertura offline após instalação completa;
- ausência de falha na instalação do Service Worker;
- os dois caminhos excluídos respondem 404 após o deploy;
- a logo continua visível a partir do conteúdo embutido no shell;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda permanecem funcionais;
- nenhuma exceção nova aparece no navegador.

## Risco e rollback

A release não altera comportamento, dados, Supabase, sincronização, estoque, WhatsApp ou regras operacionais. Em caso de regressão, o rollback deve restaurar os dois arquivos em uma versão superior com novo `CACHE_NAME`; não se deve reutilizar a chave da v0.25.108.
