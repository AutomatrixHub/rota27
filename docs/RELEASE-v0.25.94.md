# Rota 27 v0.25.94 — Ajuda sem foco automático

## Objetivo
Alinhar a abertura da **Ajuda do Sistema** ao comportamento já adotado em Nova/Editar comanda, Novo/Editar produto e Nova/Editar categoria: nenhum campo ou controle recebe foco automaticamente ao abrir.

## Causa
A Ajuda-base (`v0151-help.js`) ainda executava `focus()` no campo `#r27HelpSearch` cerca de 30 ms após a abertura do overlay. Em celulares isso podia abrir o teclado imediatamente, mesmo sem intenção do usuário.

## Correção
Nova camada `assets/v02594-help-no-autofocus.js`:
- remove qualquer atributo `autofocus` da busca;
- neutraliza o foco programático legado apenas durante a abertura da Ajuda;
- não altera o conteúdo da Ajuda v11.0;
- não impede foco manual: depois de aberta, tocar no campo de busca continua funcionando normalmente;
- não usa polling nem MutationObserver.

## Preservações
Sem alterações em:
- comandas;
- clientes;
- produtos/categorias;
- Supabase;
- sincronização;
- WhatsApp;
- Modo Teste;
- demais fluxos operacionais.

## PWA
- VERSION: `0.25.94`
- Ajuda: `11.0`
- cache: `rota27-comandas-v0.25.94-r1`

## Rollback
Baseline anterior: v0.25.93 / merge `5781ddb6adf43be9a69aa3a503e103d6637f536b`.
