# Rota 27 — Release v0.25.113

## Objetivo

Excluir o arquivo `assets/logo-rota27.png`, logo PNG histórico de 106 KB que não possui referência de carregamento na aplicação atual.

## Evidências

- ausência de referência em todo o repositório, inclusive em documentos;
- fora do App Shell e do Service Worker;
- fora de `index.html`, loaders dinâmicos e páginas auxiliares;
- a logo em uso está incorporada como `data:image/png` em `base-v013.html`.

## Preservado

- `assets/v014-rc2.js`, necessário para `v014-rc.html`;
- interface, dados locais, Supabase, sincronização, estoque e WhatsApp.

## Validações

- sintaxe do Service Worker e do roadmap;
- recursos App Shell existentes;
- endpoint do PNG removido deve responder 404 após o deploy;
- versão e cache avançados para `0.25.113`.

## Rollback

Restaurar o arquivo em uma nova release e avançar o cache, se surgir uma referência externa comprovada.
