# Rota 27 — Release v0.25.114

## Objetivo

Excluir `v014-preview.html`, entrada de preview DEV.3 sem carregamento, rota ou dependência atual.

## Evidências

- ausente do App Shell, Service Worker, `index.html` e loaders;
- nenhuma referência de execução; apenas registros históricos em documentação;
- a página auxiliar RC.2 continua em `v014-rc.html` com sua cadeia de scripts própria.

## Preservado

- `v014-rc.html` e `assets/v014-rc2.js`;
- `v015-preview.html`, porque scripts de laboratório ainda o referenciam;
- interface, dados locais, Supabase, sincronização, estoque e WhatsApp.

## Rollback

Restaurar o arquivo em nova release se surgir uso externo comprovado.
