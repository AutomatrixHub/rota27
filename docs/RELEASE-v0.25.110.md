# Release v0.25.110 — remoção de órfãos confirmados

## Objetivo

Eliminar somente scripts históricos sem qualquer referência de carregamento, mantendo intocados os módulos atuais que executam as mesmas áreas do sistema.

## Arquivos excluídos

- `assets/v015-rc1.js` — selo de release candidate v0.15;
- `assets/v0181-final.js` — selo final de versão v0.18.1;
- `assets/v02514-turn-close.js` — implementação antiga de fechamento por turno;
- `assets/v02522-closure-polish.js` — polimento antigo da tela de fechamentos.

## Evidências

- nenhum dos quatro nomes é referenciado por `index.html`, `assets/roadmap-loader.js`, `sw.js` ou páginas auxiliares;
- nenhum integra o `APP_SHELL`;
- `v02515-turn-close.js` é o módulo de fechamento atualmente carregado;
- `v02522r3-closure-render.js` é o render atual da tela de fechamentos;
- os recursos restantes do App Shell continuam presentes.

## Critérios de homologação

- instalação limpa online;
- atualização da v0.25.109 para a v0.25.110;
- abertura offline após instalação completa;
- ausência de falha na instalação do Service Worker;
- os quatro caminhos excluídos respondem 404 após o deploy;
- Lista, Mapa, Cardápio, Painel, Histórico e Ajuda permanecem funcionais;
- fechamento de turno continua disponível;
- nenhuma exceção nova aparece no navegador.

## Risco e rollback

A release não altera comportamento, dados, Supabase, sincronização, estoque, WhatsApp ou regras operacionais. Em caso de regressão, o rollback deve restaurar os quatro arquivos em uma versão superior com novo `CACHE_NAME`; não se deve reutilizar a chave da v0.25.109.
